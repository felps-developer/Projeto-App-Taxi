import axios from 'axios';

/**
 * Interface para representar as coordenadas (latitude e longitude).
 */
interface Coordinates {
    lat: number; // Latitude
    lng: number; // Longitude
}

/**
 * Função para converter dois endereços em coordenadas usando a API do Google Maps.
 * @param origin O endereço de origem a ser convertido.
 * @param destination O endereço de destino a ser convertido.
 * @returns Um objeto contendo as coordenadas de origem e destino.
 */
export const getCoordinatesFromAddressesGoogle = async (
    origin: string,
    destination: string
): Promise<{ originCoords: Coordinates; destinationCoords: Coordinates }> => {
    const apiKey = process.env.GOOGLE_API_KEY; // A chave da API do Google Maps

    // Verificando se a chave da API foi carregada corretamente
    if (!apiKey) {
        throw new Error("A chave da API não foi fornecida ou não foi carregada corretamente.");
    }

    const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

    try {
        // Codificando os endereços para evitar caracteres inválidos na URL
        const encodedOrigin = encodeURIComponent(origin);
        const encodedDestination = encodeURIComponent(destination);

       

        // Requisição para a API de Geocodificação para o endereço de origem
        const originResponse = await axios.get(geocodeUrl, {
            params: {
                address: encodedOrigin,
                key: apiKey,
            },
        });

        // Verificando a resposta da origem
        if (originResponse.data.status !== 'OK' || originResponse.data.results.length === 0) {
            console.error('Erro ao obter coordenadas para origem:', originResponse.data.status);
            throw new Error(`Não foi possível encontrar o endereço de origem: ${origin}`);
        }



        const originCoords = {
            lat: originResponse.data.results[0].geometry.location.lat,
            lng: originResponse.data.results[0].geometry.location.lng,
        };

     



        // Requisição para a API de Geocodificação para o endereço de destino
        const destinationResponse = await axios.get(geocodeUrl, {
            params: {
                address: encodedDestination,
                key: apiKey,
            },
        });

        // Verificando a resposta do destino
        if (destinationResponse.data.status !== 'OK' || destinationResponse.data.results.length === 0) {
            console.error('Erro ao obter coordenadas para destino:', destinationResponse.data.status);
            throw new Error(`Não foi possível encontrar o endereço de destino: ${destination}`);
        }

        const destinationCoords = {
            lat: destinationResponse.data.results[0].geometry.location.lat,
            lng: destinationResponse.data.results[0].geometry.location.lng,
        };

        if (originResponse.data.status === 'ZERO_RESULTS') {
            console.error('Erro ao obter coordenadas para origem:', originResponse.data.status);
            console.error('Detalhes da resposta:', originResponse.data);
            throw new Error(`Não foi possível encontrar o endereço de origem: ${origin}`);
        }

        if (destinationResponse.data.status === 'ZERO_RESULTS') {
            console.error('Erro ao obter coordenadas para destino:', destinationResponse.data.status);
            console.error('Detalhes da resposta:', destinationResponse.data);
            throw new Error(`Não foi possível encontrar o endereço de destino: ${destination}`);
        }

        

        return { originCoords, destinationCoords };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Erro ao buscar coordenadas:', error.message);
            throw new Error(`Falha ao obter as coordenadas dos endereços. Detalhes: ${error.message}`);
        } else {
            console.error('Erro desconhecido ao buscar coordenadas');
            throw new Error('Erro desconhecido ao buscar coordenadas');
        }
    }
};
