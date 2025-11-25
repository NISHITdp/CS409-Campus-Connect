import Event from "../models/Event.js";

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching events" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, location, date, time } = req.body;

    if (!title || !location || !date || !time) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    const event = await Event.create({
      title,
      description,
      location,
      date,
      time,
      createdBy: req.user._id,
      attendees: [req.user._id],
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to create event" });
  }
};

export const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({ message: "Already attending" });
    }

    event.attendees.push(req.user._id);
    await event.save();

    res.json({ message: "RSVP successful", event });
  } catch (error) {
    res.status(500).json({ message: "Unable to RSVP" });
  }
};
