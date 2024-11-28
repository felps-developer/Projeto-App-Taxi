import prismaClient from "../prisma";
import axios from 'axios';



export class ListRideService {
    async execute({ customer_id, id_motorista }: { customer_id: string; id_motorista?: number }) {

        try {
            
            const verificaUsuario = await prismaClient.user.findFirst({
                where: {
                    id: customer_id
                }
            })
            if (!verificaUsuario) {
                throw new Error("Não existe customer_id!")
            }

            const filter: any = {
                userId: customer_id, // Filtro obrigatório pelo ID do usuário
            };

            // Se um id_motorista for informado, adiciona o filtro no objeto
            if (id_motorista) {
                const verificaMotorista = await prismaClient.motorista.findFirst({
                    where: {
                        id: id_motorista,
                    }
                });

                if (!verificaMotorista) {
                    throw new Error("Motorista inválido!");
                }

                filter['motoristaId'] = id_motorista;
            }

            // Buscar as viagens com o filtro apropriado
            const listaViagens = await prismaClient.viagem.findMany({
                where: filter,
                orderBy: {
                    created_at: 'desc',  // Ordena as viagens pela data de criação, mais recentes primeiro
                },
                include: {
                    Motorista: true,
                }
            });



            return listaViagens.map(listaViagens => ({
                id: listaViagens.id,
                date: listaViagens.created_at,
                origin: ` ${listaViagens.latitude_inicial} e ${listaViagens.longitude_inicial}`,
                destination: ` ${listaViagens.latitude_final} e ${listaViagens.longitude_final}`,
                distance: Number(listaViagens.distancia),
                duration: listaViagens.tempo_percurso.toString(),
                driver: {
                    id: listaViagens.motoristaId,
                    name: listaViagens.Motorista?.name,
                },
                value: listaViagens.valor_total,
            }));
        }
        catch (error: any) {
            console.error('Erro ao calcular a rota:', error.message);
            if (error.response) {
                console.error('Detalhes do erro:', error.response.data);
            }
        }
    }
}
