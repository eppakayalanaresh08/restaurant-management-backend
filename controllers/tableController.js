const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const generateQRCode = require('../utils/generateQR');
const { BASE_URL } = process.env;

// Create a new table
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, location, capacity } = req.body;
    
    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }
    
    // Generate QR code URL
    const qrData = `${BASE_URL}/api/tables/${tableNumber}/menu`;
    const qrFilename = await generateQRCode(qrData, 'table');
    
    const table = new Table({
      tableNumber,
      location,
      capacity,
      qrCode: qrFilename,
    });
    
    await table.save();
    
    res.status(201).json({
      message: 'Table created successfully',
      table,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating table', error: error.message });
  }
};

// Get all tables
// exports.getAllTables = async (req, res) => {
//   try {
//     const tables = await Table.find().populate('assignedServer', 'name');
//     res.status(200).json(tables);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching tables', error: error.message });
//   }
// };




exports.getAllTables = async (req, res) => {
  try {
    const { status, location, minCapacity } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (location) filter.location = location;
    if (minCapacity) filter.capacity = { $gte: parseInt(minCapacity) };
    
    const tables = await Table.find(filter).populate('assignedServer', 'name');
    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tables', error: error.message });
  }
};












// Get table by ID
exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('assignedServer', 'name');
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.status(200).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching table', error: error.message });
  }
};


// Edit table - Update all fields
// exports.updateTable = async (req, res) => {
//   try {
//     const { tableNumber, location, capacity, status } = req.body;
//     const tableId = req.params.id;

//     // Check if table exists
//     const existingTable = await Table.findById(tableId);
//     if (!existingTable) {
//       return res.status(404).json({ message: 'Table not found' });
//     }

//     // Check if new table number already exists (if changed)
//     if (tableNumber && tableNumber !== existingTable.tableNumber) {
//       const tableWithSameNumber = await Table.findOne({ tableNumber });
//       if (tableWithSameNumber) {
//         return res.status(400).json({ message: 'Table number already exists' });
//       }
//     }

//     // Prepare update object
//     const updateData = {};
//     if (tableNumber) updateData.tableNumber = tableNumber;
//     if (location) updateData.location = location;
//     if (capacity) updateData.capacity = capacity;
//     if (status) updateData.status = status;

//     // Update the table
//     const updatedTable = await Table.findByIdAndUpdate(
//       tableId,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate('assignedServer', 'name');

//     res.status(200).json({
//       message: 'Table updated successfully',
//       table: updatedTable
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Error updating table', 
//       error: error.message 
//     });
//   }
// };




exports.updateTable = async (req, res) => {
  try {
    const { tableNumber, location, capacity, status } = req.body;
    const tableId = req.params.id;

    // Check if table exists
    const existingTable = await Table.findById(tableId);
    if (!existingTable) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Check if new table number already exists (excluding current table)
    if (tableNumber && tableNumber !== existingTable.tableNumber) {
      const tableWithSameNumber = await Table.findOne({ 
        tableNumber,
        _id: { $ne: tableId } // Exclude current table
      });
      if (tableWithSameNumber) {
        return res.status(400).json({ message: 'Table number already exists' });
      }
    }

    // Prepare update object
    const updateData = {};
    if (tableNumber) updateData.tableNumber = tableNumber;
    if (location) updateData.location = location;
    if (capacity) updateData.capacity = capacity;
    if (status) updateData.status = status;

    // Update the table
    const updatedTable = await Table.findByIdAndUpdate(
      tableId,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedServer', 'name');

    res.status(200).json({
      message: 'Table updated successfully',
      table: updatedTable
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating table', 
      error: error.message 
    });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    // Check for active reservations first
    const activeReservations = await Reservation.find({ 
      table: req.params.id,
      status: { $in: ['confirmed', 'pending'] }
    });
    
    if (activeReservations.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete table with active reservations',
        reservations: activeReservations.map(r => r._id)
      });
    }

    // Delete the table
    const table = await Table.findByIdAndDelete(req.params.id);
    
    if (!table) return res.status(404).json({ message: 'Table not found' });
    
    // Optionally: Delete associated QR code file
    // fs.unlinkSync(path.join(__dirname, '../public/qrcodes', table.qrCode));
    
    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting table', error: error.message });
  }
};


// Update table status
exports.updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    res.status(200).json({
      message: 'Table status updated successfully',
      table,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating table status', error: error.message });
  }
};







// Assign server to table
exports.assignServer = async (req, res) => {
  try {
    const { serverId } = req.body;
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { assignedServer: serverId },
      { new: true }
    ).populate('assignedServer', 'name');
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    res.status(200).json({
      message: 'Server assigned to table successfully',
      table,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning server', error: error.message });
  }
};

// Create a reservation
exports.createReservation = async (req, res) => {
  try {
    const { tableId, customerName, customerPhone, reservationDate, partySize, specialRequests } = req.body;
    
    // Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Check if table is available
    if (table.status !== 'available') {
      return res.status(400).json({ message: 'Table is not available for reservation' });
    }
    
    // Check if party size exceeds table capacity
    if (partySize > table.capacity) {
      return res.status(400).json({ message: 'Party size exceeds table capacity' });
    }
    
    // Create reservation
    const reservation = new Reservation({
      table: tableId,
      customerName,
      customerPhone,
      customerEmail: req.body.customerEmail || '',
      reservationDate: new Date(reservationDate),
      partySize,
      specialRequests: specialRequests || '',
    });
    
    await reservation.save();
    
    // Update table status
    table.status = 'reserved';
    await table.save();
    
    res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
};

// Get table availability
exports.checkAvailability = async (req, res) => {
  try {
    const { date, time, partySize } = req.query;
    
    // Combine date and time into a DateTime object
    const reservationDateTime = new Date(`${date}T${time}`);
    
    // Find all tables that can accommodate the party size
    const tables = await Table.find({ 
      capacity: { $gte: parseInt(partySize) },
      status: 'available',
    });
    
    // Check for conflicting reservations
    const reservedTables = await Reservation.find({
      reservationDate: {
        $gte: new Date(reservationDateTime.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
        $lte: new Date(reservationDateTime.getTime() + 2 * 60 * 60 * 1000), // 2 hours after
      },
      status: 'confirmed',
    }).distinct('table');
    
    // Filter out tables with conflicting reservations
    const availableTables = tables.filter(
      table => !reservedTables.includes(table._id)
    );
    
    res.status(200).json({
      availableTables,
      totalAvailable: availableTables.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking availability', error: error.message });
  }
};

// Get QR code for table
exports.getTableQR = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table || !table.qrCode) {
      return res.status(404).json({ message: 'QR code not found for this table' });
    }
    
    res.status(200).sendFile(path.join(__dirname, '../public/qrcodes', table.qrCode));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching QR code', error: error.message });
  }
};







// // Update table details
// exports.updateTable = async (req, res) => {
//   try {
//     const { tableNumber, location, capacity, status } = req.body;
    
//     // Check if table exists
//     const table = await Table.findById(req.params.id);
//     if (!table) {
//       return res.status(404).json({ message: 'Table not found' });
//     }
    
//     // Check if new table number already exists (if it's being changed)
//     if (tableNumber && tableNumber !== table.tableNumber) {
//       const existingTable = await Table.findOne({ tableNumber });
//       if (existingTable) {
//         return res.status(400).json({ message: 'Table number already exists' });
//       }
//     }
    
//     // Update table fields
//     if (tableNumber) table.tableNumber = tableNumber;
//     if (location) table.location = location;
//     if (capacity) table.capacity = capacity;
//     if (status) table.status = status;
    
//     await table.save();
    
//     res.status(200).json({
//       message: 'Table updated successfully',
//       table,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating table', error: error.message });
//   }
// };



















// exports.updateTable = async (req, res) => {
//   try {
//     const { tableNumber, location, capacity, status } = req.body;
//     console.log(`Updating table ${req.params.id} with:`, req.body);

//     // Validate required fields
//     if (!tableNumber || !location || !capacity) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     // Find table
//     const table = await Table.findById(req.params.id);
//     if (!table) {
//       return res.status(404).json({ message: 'Table not found' });
//     }

//     // Check for duplicate table number if changed
//     if (tableNumber !== table.tableNumber) {
//       const existingTable = await Table.findOne({ tableNumber });
//       if (existingTable) {
//         return res.status(400).json({ message: 'Table number already exists' });
//       }
//     }

//     // Update fields
//     table.tableNumber = tableNumber;
//     table.location = location;
//     table.capacity = capacity;
//     if (status) table.status = status;

//     await table.save();
//     res.status(200).json({ message: 'Table updated successfully', table });

//   } catch (error) {
//     console.error('Update table error:', error);
//     res.status(500).json({ message: 'Error updating table', error: error.message });
//   }
// };




// exports.updateTable = async (req, res) => {
//   try {
//     const { tableNumber, location, capacity, status } = req.body;
//     console.log(`Updating table ${req.params.id} with:`, req.body);

//     // Find table
//     const table = await Table.findById(req.params.id);
//     if (!table) {
//       return res.status(404).json({ message: 'Table not found' });
//     }

//     // Check for duplicate table number ONLY if it's being changed
//     if (tableNumber && tableNumber !== table.tableNumber) {
//       const existingTable = await Table.findOne({ tableNumber });
//       if (existingTable) {
//         return res.status(400).json({ message: 'Table number already exists' });
//       }
//       table.tableNumber = tableNumber;
//     }

//     // Update other fields
//     if (location) table.location = location;
//     if (capacity) table.capacity = capacity;
//     if (status) table.status = status;

//     await table.save();
//     res.status(200).json({ message: 'Table updated successfully', table });

//   } catch (error) {
//     console.error('Update table error:', error);
//     res.status(500).json({ message: 'Error updating table', error: error.message });
//   }
// };

