import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



async function seed() {
  console.log('Iniciando a criação de motoristas...');
  try {    
    
    
        // Inserir motoristas
    const motorista1 = await prisma.motorista.create({
        data: {
          name: 'Homer Simpson',
          descricao: 'Olá! Sou o Homer, seu motorista camarada! Relaxe e aproveite o passeio, com direito a rosquinhas e boas risadas (e talvez alguns desvios).',
          carro: 'Plymouth Valiant 1973 rosa e enferrujado',
          avaliacao: '2/5 Motorista simpático, mas errou o caminho 3 vezes. O carro cheira a donuts.',
          taxa: 2.50,
          km_minimo: 15.0,
        },
      });
  
      const motorista2 = await prisma.motorista.create({
        data: {
          name: 'Dominic Toretto',
          descricao: 'Ei, aqui é o Dom. Pode entrar, vou te levar com segurança e rapidez ao seu destino. Só não mexa no rádio, a playlist é sagrada.',
          carro: 'Dodge Charger R/T 1970 modificado',
          avaliacao: '4/5 Que viagem incrível! O carro é um show à parte e o motorista, apesar de ter uma cara de poucos amigos, foi super gente boa. Recomendo!',
          taxa: 5.00,
          km_minimo: 10.0,
        },
      });
  
      const motorista3 = await prisma.motorista.create({
        data: {
          name: 'James Bond',
          descricao: 'Boa noite, sou James Bond. À seu dispor para um passeio suave e discreto. Aperte o cinto e aproveite a viagem.',
          carro: 'Aston Martin DB5 clássico',
          avaliacao: '5/5 Serviço impecável! O motorista é a própria definição de classe e o carro é simplesmente magnífico. Uma experiência digna de um agente secreto.',
          taxa: 10.00,
          km_minimo: 20.0,
        },
      });
      
    
    

    
  } catch (error) {
    console.error('Erro ao inserir motoristas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();