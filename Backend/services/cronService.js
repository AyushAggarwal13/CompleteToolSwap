import cron from 'node-cron';
import Booking from '../models/bookingModel.js';
import Tool from '../models/toolModel.js';
import { io, activeUsers } from '../index.js';
import mongoose from 'mongoose';

const job = cron.schedule('* * * * *', async () => {
    // Skip if MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
        console.log('Skipping cron job - MongoDB not connected');
        return;
    }
    
    console.log('Running cron job to check for expired bookings...');
    const now = new Date();

    try {
        const expiredBookings = await Booking.find({
            status: 'approved',
            endDate: { $lt: now }
        }).populate('tool');

        for (const booking of expiredBookings) {
            // Update booking status
            booking.status = 'completed';
            await booking.save();
            console.log(`Booking ${booking._id} status updated to completed.`);

            // Update tool availability
            const tool = await Tool.findById(booking.tool._id);
            if (tool) {
                tool.availability = true;
                await tool.save();
                console.log(`Tool ${tool._id} availability updated to true.`);
            }

            // Notify the borrower
            const borrower = activeUsers[booking.borrower.toString()];
            if (borrower) {
                io.to(borrower.socketId).emit('booking_status_updated', {
                    message: `Your borrowing time for "${booking.tool.name}" has expired. Please return the tool to the owner in the same condition.`,
                    bookingDetails: booking,
                });
            }

            // Notify the owner
            const owner = activeUsers[booking.owner.toString()];
            if (owner) {
                io.to(owner.socketId).emit('booking_status_updated', {
                    message: `The borrowing time for "${booking.tool.name}" has expired. The borrower has been notified.`,
                    bookingDetails: booking,
                });
            }
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

export default job;