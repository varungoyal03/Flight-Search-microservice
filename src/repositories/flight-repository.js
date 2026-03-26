const { Sequelize } = require('sequelize');

const CrudRepository = require('./crud-repository');
const { Flight, Airplane, Airport, City } = require('../models');
const db = require('../models');





class FlightRepository extends CrudRepository {
    constructor() {
        super(Flight);
    }

    async getAllFlights(filter, sort) {
        const response = await Flight.findAll({
            where: filter,
            order: sort,
            include: [
                {
                    model: Airplane,
                    required: true,
                    as: 'airplaneDetail',
                },
                {
                    model: Airport,
                    required: true,
                    as: 'departureAirport',
                    include: {
                        model: City,
                        required: true
                    }
                },
                {
                    model: Airport,
                    required: true,
                    as: 'arrivalAirport',
                    include: {
                        model: City,
                        required: true
                    }
                }
            ]
        });
        return response;
    }

// async updateRemainingSeats(flightId, seats, dec = true) {
//     console.log(`🚀 Starting updateRemainingSeats`);
    
//     const maxRetries = 3;
//     let lastError;
    
//     for (let attempt = 1; attempt <= maxRetries; attempt++) {
//         try {
//             // First verify flight exists and has enough seats
//             const flight = await Flight.findByPk(flightId, {
//                 attributes: ['id', 'totalSeats']
//             });
            
//             if (!flight) {
//                 throw new Error('Flight not found');
//             }
            
//             if (dec && flight.totalSeats < seats) {
//                 throw new Error(`Only ${flight.totalSeats} seats available`);
//             }
            
//             console.log(`🔁 Attempting ${dec ? 'decrement' : 'increment'} of ${seats} seats (Attempt ${attempt}/${maxRetries})...`);
            
//             // Use raw SQL with atomic operation
//             const query = dec 
//                 ? `UPDATE Flights SET totalSeats = totalSeats - :seats, updatedAt = NOW() WHERE id = :flightId AND totalSeats >= :seats`
//                 : `UPDATE Flights SET totalSeats = totalSeats + :seats, updatedAt = NOW() WHERE id = :flightId`;
            
//             const [result] = await db.sequelize.query(query, {
//                 replacements: { seats: parseInt(seats), flightId },
//                 type: Sequelize.QueryTypes.UPDATE,
//                 timeout: 30000
//             });
            
//             if (result === 0) {
//                 if (dec) {
//                     // Re-check seats (another request may have updated)
//                     throw new Error('Seat update failed - seats may have been sold by another request');
//                 } else {
//                     throw new Error('Flight not found');
//                 }
//             }
            
//             console.log('repo before update');
//             // Get updated flight data
//             const updatedFlight = await Flight.findByPk(flightId, {
//                 include: [
//                     {
//                         model: Airplane,
//                         as: 'airplaneDetail'
//                     }
//                 ]
//             });
//             console.log('repo after update');
            
//             console.log(`✅ Update successful! New seat count: ${updatedFlight.totalSeats}`);
//             return updatedFlight;
            
//         } catch (error) {
//             lastError = error;
            
//             // Check if it's a lock timeout error
//             if (error.code === 'ER_LOCK_WAIT_TIMEOUT' && attempt < maxRetries) {
//                 const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff: 1s, 2s, 4s
//                 console.log(`⏳ Lock timeout detected. Retrying in ${delay}ms...`);
//                 await new Promise(resolve => setTimeout(resolve, delay));
//                 continue;
//             } else {
//                 console.error(`❌ Error in updateRemainingSeats (Attempt ${attempt}): ${error.message}`);
//                 break;
//             }
//         }
//     }
    
//     // All retries exhausted
//     throw lastError;
// }



//     async updateRemainingSeats(flightId, seats, dec = true) {//dec pass as 1 for decrement and 0 for increment

         
//         const transaction = await db.sequelize.transaction();
    
     
//         try {
        
          
//   const flight = await Flight.findByPk(flightId, { transaction: transaction });
        
//         if (!flight) {
//             throw new Error('Flight not found');
//         }

//         // 🔴 CRITICAL CHECK
//         if (+dec && flight.totalSeats < seats) {
//             throw new Error('Not enough seats available');
//         }

//         if (+dec) {
         
//             await flight.decrement('totalSeats', { by: seats, transaction });
         
//         } else {
//             await flight.increment('totalSeats', { by: seats, transaction });
//         }


      

//             await transaction.commit();
           
//             return flight;
//         } catch(error) {
//             await transaction.rollback();
//             throw error;
//         }
       
//     }

    async updateRemainingSeats(flightId, seats, dec = true) {
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await Flight.findByPk(flightId, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!flight) {
            throw new Error('Flight not found');
        }

        // 🔒 Prevent overselling (CRITICAL)
        if (dec && flight.totalSeats < seats) {
            throw new Error('Not enough seats available');
        }

        if (dec) {
            await flight.decrement('totalSeats', { by: seats, transaction });
        } else {
            await flight.increment('totalSeats', { by: seats, transaction });
        }

        await transaction.commit();
        return flight;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
}





module.exports = FlightRepository;
