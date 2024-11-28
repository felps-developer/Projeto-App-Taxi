import prismaClient from "../prisma";
import axios from 'axios';
import { getCoordinatesFromAddressesGoogle } from "./GeocodeService";


export class RideService {


    /**
     * Função para calcular a rota entre duas coordenadas.
     * @param origin Coordenadas de origem no formato { latitude, longitude }
     * @param destination Coordenadas de destino no formato { latitude, longitude }
     * @param travelMode Modo de viagem (ex: 'DRIVE')
     * @returns Dados da rota calculada
     */



    static async calculateRoute(
        origin: { latitude: number; longitude: number },
        destination: { latitude: number; longitude: number },
        travelMode: 'DRIVE' | 'WALK' | 'BICYCLE'
    ): Promise<any> {
        const directionsUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            throw new Error('A chave de API do Google não foi configurada.');
        }

        try {
            const response = await axios.post(
                `${directionsUrl}?key=${apiKey}`,
                {
                    origin: {
                        location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } }
                    },
                    destination: {
                        location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } }
                    },
                    travelMode,
                    routingPreference: 'TRAFFIC_AWARE',
                    computeAlternativeRoutes: false,
                    units: 'METRIC',
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
                    },
                }
            );

            const routes = response.data.routes;
            if (routes && routes.length > 0) {
                const route = routes[0];

                const distanceInKm = parseFloat((route.distanceMeters / 1000).toFixed(2));
                const durationInMinutes = route.duration ? parseInt(route.duration.split('s')[0]) / 60 : null;
                const polyline = route.polyline?.encodedPolyline || null;

                // Verifica se todos os dados necessários estão presentes
                if (distanceInKm !== null && durationInMinutes !== null && polyline) {
                    return {
                        distanceInKm,
                        durationInMinutes,
                        polyline,
                    };
                } else {
                    console.warn('Dados incompletos retornados pela API:', route);
                    throw new Error('Dados incompletos retornados pela API.');
                }
            } else {
                throw new Error('Nenhuma rota encontrada ou resposta vazia.');
            }
        } catch (error: any) {
            console.error('Erro ao calcular a rota:', error.message);
            if (error.response) {
                console.error('Detalhes do erro:', error.response.data);
            }
            throw new Error('Falha ao obter a rota. Verifique os dados fornecidos.');
        }
    }






    /**
     * Função para estimar a viagem com base em dois endereços.
     * @param origin Endereço de origem
     * @param destination Endereço de destino
     * @returns Estimativa de viagem contendo as coordenadas de origem e destino, distância e duração
     */
    static async estimateRide(customer_id: string, origin: string, destination: string) {
        try {
            // Obter as coordenadas de origem e destino usando a função pronta
            const { originCoords, destinationCoords } = await getCoordinatesFromAddressesGoogle(origin, destination);
            const travelMode: 'DRIVE' = 'DRIVE'; // Definindo modo de viagem como 'DRIVE'

            // Calcular a rota entre as coordenadas obtidas
            const routeData = await this.calculateRoute(
                { latitude: originCoords.lat, longitude: originCoords.lng },
                { latitude: destinationCoords.lat, longitude: destinationCoords.lng },
                travelMode
            );

            // Verificar se os dados da rota são válidos
            if (!routeData || !routeData.distanceInKm || !routeData.durationInMinutes || !routeData.polyline) {
                console.error("Dados incompletos retornados pela API de rota:", routeData);
                throw new Error('Nenhuma rota encontrada ou dados insuficientes para os pontos fornecidos.');
            }

            const { distanceInKm, durationInMinutes, polyline } = routeData;

            // Consultar motoristas no banco de dados
            const listaMotorista = await prismaClient.motorista.findMany({
                where: {
                    km_minimo: {
                        lte: distanceInKm,
                    },
                },
            });

            // Se não houver motoristas, lançar erro apropriado
            if (!listaMotorista || listaMotorista.length === 0) {
                throw new Error('Nenhum motorista encontrado para o trajeto calculado.');
            }

            const encontrarUsuario = await prismaClient.user.findUnique({
                where: {
                    id: customer_id,
                },
            });



            // Verifique se o usuário já existe antes de criar
            if (!encontrarUsuario) {
                // Só cria o usuário se ele não existir

                const criarUsuario = await prismaClient.user.create({
                    data: {
                        id: customer_id,
                        name: "Nome do Usuário",
                    },
                });

                console.log("Usuário criado com sucesso:", criarUsuario);

            }

            // Calcular o valor total da viagem com base na taxa do motorista
            const listaMotoristaComValor = listaMotorista.map(motorista => {
                const valorMotorista = parseFloat((motorista.taxa * distanceInKm).toFixed(2));
                return {
                    ...motorista,
                    valorTotal: valorMotorista,
                };
            });

            // Ordenar motoristas com base no valor total
            const listaMotoristaOrdenada = listaMotoristaComValor.sort((a, b) => a.valorTotal - b.valorTotal);

            // Mapear motoristas para o formato de retorno esperado
            const options = listaMotoristaOrdenada.map(motorista => {
                const { id, name, descricao, carro, avaliacao, valorTotal } = motorista;
                const [rating, ...reviewParts] = (avaliacao || '0/5 Sem avaliação').split(' ');
                const reviewComment = reviewParts.join(' ') || 'Sem avaliação';

                return {
                    id,
                    name,
                    description: descricao,
                    vehicle: carro,
                    review: {
                        rating: parseFloat(rating.split('/')[0]), // Extrair apenas a nota da avaliação
                        comment: reviewComment,
                    },
                    value: valorTotal,
                };
            });

            // Retornar a estimativa da viagem
            return {
                origin: {
                    latitude: originCoords.lat,
                    longitude: originCoords.lng,
                },
                destination: {
                    latitude: destinationCoords.lat,
                    longitude: destinationCoords.lng,
                },
                distance: distanceInKm,
                duration: durationInMinutes.toFixed(2), // Formatar duração com 2 casas decimais
                options,
                routePolyline: polyline,
            };
        } catch (error: any) {
            console.error('Erro ao estimar a viagem:', error.message);
            throw {
                error_code: 'INVALID_DATA',
                error_description: error.message || 'Dados fornecidos são inválidos.',
            };
        }
    }

    /**
     * Função para confirmar a viagem (salvar no banco, etc.)
     * @param origin Coordenadas de origem
     * @param destination Coordenadas de destino
     * @param userId ID do usuário
     * @param motoristaId ID do motorista
     * @param distancia Distância calculada
     * @param tempo Tempo estimado
     * @param valorTotal Valor total da viagem
     * @returns Dados da viagem confirmada
     */
    static async confirmRide(
        customer_id: string,
        origin: string,
        destination: string,
        distance: number,
        duration: string,
        driver: { id: number, name: string },
        value: number
    ) {
        try {


            // Obter a estimativa da viagem
            const estimativa = await this.estimateRide(customer_id, origin, destination);

            // Validar os resultados da estimativa
            if (!estimativa || !estimativa.origin || !estimativa.destination) {
                throw new Error('Falha ao obter estimativa de viagem.');
            }
            


            // Gravar a viagem no banco de dados
            const viagem = await prismaClient.viagem.create({
                data: {
                    latitude_inicial: estimativa.origin.latitude,
                    longitude_inicial: estimativa.origin.longitude,
                    latitude_final: estimativa.destination.latitude,
                    longitude_final: estimativa.destination.longitude,
                    distancia: distance, // Distância em KM
                    tempo_percurso: duration,
                    avaliacao_motorista: '', // Avaliação inicial
                    valor_total: value, // Valor calculado
                    userId: customer_id, // ID do usuário
                    motoristaId: driver.id, // ID do motorista selecionado
                },
            });

            // Retorno de sucesso
            return {
                message: 'Viagem confirmada com sucesso!',
                viagem,
            };
        } catch (error: any) {
            console.error('Erro ao confirmar a viagem:', error.message);

            // Erro específico para ser tratado no controller
            throw {
                error_code: 'CONFIRM_RIDE_ERROR',
                error_description: error.message || 'Erro inesperado ao confirmar a viagem.',
            };
        }
    }
}


