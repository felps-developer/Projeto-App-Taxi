import { Request, Response } from 'express';
import { RideService } from '../services/RideService'; // Importando o serviço
import prismaClient from '../prisma';

export class RideController {
    /**
     * Endpoint para estimar a viagem com base em dois endereços.
     * @param req Requisição com os parâmetros `origin` e `destination`
     * @param res Resposta com a estimativa de viagem (distância e duração)
     */
    static async estimate(req: Request, res: Response) {
        const { customer_id, origin, destination } = req.body;

        // Validação dos parâmetros
        if (!customer_id) {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo 'customer_id' é obrigatório."
            });
        }

        if (!origin || !destination) {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "Os campos 'origin.latitude', 'origin.longitude', 'destination.latitude' e 'destination.longitude' são obrigatórios."
            });
        }

        try {
            // Chamando o serviço para estimar a viagem
            const estimate = await RideService.estimateRide(customer_id, origin, destination);

            // Retornando a estimativa ao cliente
            return res.status(200).json(estimate);
        } catch (error: any) {
            console.error("Erro no controlador:", error.message, {
                customer_id,
                origin,
                destination,
                stack: error.stack, // Inclua a stack trace para depuração
            });

            if (error.message.includes("Falha ao calcular a rota")) {
                return res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: "Não foi possível calcular a rota com os dados fornecidos."
                });
            }

            // Tratamento de outros erros
            return res.status(500).json({
                error_code: "INTERNAL_SERVER_ERROR",
                error_description: "Ocorreu um erro inesperado no servidor."
            });
        }
    }


    /**
     * Endpoint para listar motoristas com base na distância da viagem.
     * @param req Requisição com parâmetros necessários para calcular a lista de motoristas
     * @param res Resposta com a lista ordenada de motoristas
     */
    // static async listaMotorista(req: Request, res: Response) {
    //     const { userId, origin, destination } = req.body;

    //     if (!origin || !destination) {
    //         return res.status(400).json({ error: 'Os endereços de origem e destino são obrigatórios.' });
    //     }

    //     try {
    //         const motoristas = await RideService.ListaMotorista(userId, origin, destination);
    //         return res.status(200).json(motoristas);
    //     } catch (error: any) {
    //         console.error('Erro ao listar motoristas:', error.message);
    //         return res.status(500).json({ error: 'Falha ao listar os motoristas' });
    //     }
    // }

    /**
     * Endpoint para confirmar a viagem, salvando no banco de dados.
     * @param req Requisição com os dados necessários para confirmar a viagem
     * @param res Resposta com a confirmação da viagem
     */
    static async confirm(req: Request, res: Response) {
        const { customer_id, origin, destination, distance, duration, driver, value }:
            { customer_id: string, origin: string, destination: string, distance: number, duration: string, driver: { id: number, name: string }, value: number } = req.body;

        if (!origin || !destination || !customer_id || !value || !distance || !duration) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios para confirmar a viagem.' });
        }
        if (origin === destination) {
            return res.status(400).json({
                error_code: 'INVALID_DATA',
                error_description: 'Os endereços de origem e destino não podem ser o mesmo.',
            });
        }

        if (!driver || !driver.id || !driver.name) {
            return res.status(400).json({
                error_code: 'INVALID_DATA',
                error_description: 'Uma opção de motorista válida deve ser informada.',
            });
        }

        try {
            // Verificar se o motorista existe no banco de dados
            const motorista = await prismaClient.motorista.findUnique({
                where: { id: driver.id },
            });

            if (!motorista) {
                return res.status(404).json({
                    error_code: 'DRIVER_NOT_FOUND',
                    error_description: 'Motorista não encontrado.',
                });
            }
            // Verificar se a quilometragem informada é válida para o motorista
            if (distance < motorista.km_minimo) {
                return res.status(406).json({
                    error_code: 'INVALID_DISTANCE',
                    error_description: `A quilometragem da viagem é inferior ao km mínimo do motorista ${motorista.name}.`,
                });
            }
            const confirmation = await RideService.confirmRide(
                customer_id, origin, destination, distance, duration, driver, value
            );
            // Resposta de sucesso
            if (confirmation) {
                return res.status(200).json({ success: true });
            } else {
                // Se a confirmação falhar, retorne um erro
                return res.status(500).json({
                    error_code: 'CONFIRMATION_FAILED',
                    error_description: 'Falha ao confirmar a viagem.',
                });
            }

        } catch (error) {
            console.error('Erro ao salvar a viagem:', error);
            return res.status(500).json({
                error_code: 'INTERNAL_SERVER_ERROR',
                error_description: 'Erro interno ao tentar salvar a viagem.',
            });
        }
    }


}
