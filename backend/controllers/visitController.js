const VisitRequest = require('../models/VisitRequest');
const Property = require('../models/Property');

// Tenant creates a request
exports.createVisitRequest = async (req, res) => {
  // --- THIS IS THE CHANGE ---
  const { propertyId, date, time } = req.body;
  const tenantId = req.user.id;

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const newVisit = new VisitRequest({
      property: propertyId,
      tenant: tenantId,
      owner: property.owner,
      requestedDate: date, // <-- Save the date
      requestedTime: time,   // <-- Save the time
    });

    await newVisit.save();
    res.status(201).json(newVisit);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Owner accepts or rejects a request
exports.updateVisitStatus = async (req, res) => {
  const { visitId } = req.params;
  const { status } = req.body;
  const ownerId = req.user.id;

  try {
    const visit = await VisitRequest.findById(visitId);
    if (!visit) {
      return res.status(404).json({ message: 'Visit request not found' });
    }

    if (visit.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    visit.status = status;
    await visit.save();

    const io = req.app.get('socketio');
    const tenantSocketRoom = visit.tenant.toString();
    io.to(tenantSocketRoom).emit('visitStatusUpdate', visit);

    res.json(visit);
  } catch (error) {
    console.error("Error updating visit status:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// --- THIS IS THE FIX ---
// Add the logic to find visits where the tenant matches the logged-in user
exports.getTenantVisits = async (req, res) => {
  const tenantId = req.user.id;
  try {
    const visits = await VisitRequest.find({ tenant: tenantId })
      .populate('property', 'title _id') // Populate property title and ID
      .populate('owner', 'username');   // Populate owner's username
    res.json(visits);
  } catch (error) {
    console.error("Error fetching tenant visits:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// This function is mostly correct, but let's ensure it populates all needed data
exports.getOwnerVisits = async (req, res) => {
  const ownerId = req.user.id;
  try {
    const visits = await VisitRequest.find({ owner: ownerId })
      .populate('property', 'title _id') // Populate property title and ID
      .populate('tenant', 'username');   // Populate tenant's username
    res.json(visits);
  } catch (error) {
    console.error("Error fetching owner visits:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};