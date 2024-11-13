import { connectToDatabase } from "./db";
import Class from "@/models/Class";
import Programme from "@/models/Programme";

export async function seedClasses() {
  try {
    await connectToDatabase();

    // Check if there are any existing classes
    const existingClasses = await Class.find();
    if (existingClasses.length > 0) {
      console.log("Classes already seeded. Skipping...");
      return;
    }

    // Fetch existing programmes
    const programmes = await Programme.find();

    if (!programmes || programmes.length === 0) {
      throw new Error(
        "No existing programmes found. Please add programmes before seeding classes."
      );
    }

    // Use the first three programmes or repeat if less than three
    const programmeIds = programmes.slice(0, 3).map((p) => p._id);
    while (programmeIds.length < 3) {
      programmeIds.push(programmeIds[programmeIds.length - 1]);
    }

    const initialClasses = [
      {
        name: "Class 1A",
        programme: programmeIds[0],
        capacity: 40,
        occupancy: 35,
        electiveSubjects: ["Physics", "Chemistry"],
      },
      {
        name: "Class 1B",
        programme: programmeIds[1],
        capacity: 35,
        occupancy: 30,
        electiveSubjects: ["Literature", "History"],
      },
      {
        name: "Class 2A",
        programme: programmeIds[2],
        capacity: 38,
        occupancy: 36,
        electiveSubjects: ["Accounting", "Economics"],
      },
    ];

    // Insert the initial classes
    await Class.insertMany(initialClasses);
    console.log("Classes seeded successfully");
  } catch (error) {
    console.error("Error seeding classes:", error);
  }
}
