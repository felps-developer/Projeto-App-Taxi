import { Response, Request } from "express";
import { ListRideService } from "../services/ListRideService";
import prismaClient from "../prisma";


export class ListRideController {
    async handle(req: Request, res: Response) {
        // Obtendo os parâmetros de query
        const customer_id = req.query.customer_id as string;
        const id_motorista = req.query.id_motorista ? parseInt(req.query.id_motorista as string) : undefined;

        // Verificando se o customer_id foi passado
        if (!customer_id) {
            return res.status(400).json({
                error_code: 'INVALID_DATA',
                error_description: 'O id do cliente não pode estar em branco.',
            });
        }

        if (id_motorista) {
            
            const verificaMotorista = await prismaClient.motorista.findFirst({
                where: {
                    id: id_motorista
                }
            });

            if (!verificaMotorista) {
                
                return res.status(404).json({
                    error_code: "INVALID_DRIVER",
                    error_description: 'Motorista Invalido',
                });
            }

            
        }

        try {
           
            // Instanciando o serviço que vai buscar as viagens
            const listViagem = new ListRideService();
            
            // Executando o serviço para buscar as viagens
            const rides = await listViagem.execute({
                customer_id,
                id_motorista,
            });

            // Verificando se foi encontrada alguma viagem
            if (!rides || rides.length === 0) {
                return res.status(404).json({
                    error_code: 'NO_RIDES_FOUND',
                    error_description: 'Nenhuma viagem encontrada para o cliente.',
                });
            }

            // Retornando as viagens
            return res.status(200).json(rides);
        } catch (error) {
            console.error('Erro ao listar viagens:', error);
            return res.status(500).json({
                error_code: 'INTERNAL_SERVER_ERROR',
                error_description: 'Erro interno ao tentar listar as viagens.',
            });
        }
    }
}
