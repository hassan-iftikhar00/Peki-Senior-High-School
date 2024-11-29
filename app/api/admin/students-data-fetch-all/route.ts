import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";

export async function GET(request: NextRequest) {
  await connectToDatabase();

  try {
    const students = await Candidate.find(
      {},
      "-passportPhoto -serialNumber -pin -lastUpdated -uploads -__v -createdAt -house -houseId -classCapacity -updatedAt -feepaid -_id"
    )
      .populate({
        path: "additionalInfo",
        model: "AdditionalInfo",
        select:
          "presentAddress nationality homeTown religion previousSchool beceYear",
      })
      .populate({
        path: "academicInfo",
        model: "AcademicInfo",
        select: "coreSubjects electiveSubjects selectedClass classCapacity",
      })
      .populate({
        path: "guardianInfo",
        model: "GuardianInfo",
        select: "guardianName relationship phoneNumber whatsappNumber email",
      })
      .lean();

    const formattedStudents = students.map((student) => ({
      ...student,
      additionalInfo:
        student.additionalInfo && Object.keys(student.additionalInfo).length > 0
          ? {
              presentAddress: student.additionalInfo.presentAddress || "",
              nationality: student.additionalInfo.nationality || "",
              homeTown: student.additionalInfo.homeTown || "",
              religion: student.additionalInfo.religion || "",
              previousSchool: student.additionalInfo.previousSchool || "",
              beceYear: student.additionalInfo.beceYear || "",
            }
          : {
              presentAddress: "",
              nationality: "",
              homeTown: "",
              religion: "",
              previousSchool: "",
              beceYear: "",
            },
      academicInfo:
        student.academicInfo && Object.keys(student.academicInfo).length > 0
          ? {
              coreSubjects: student.academicInfo.coreSubjects || [],
              electiveSubjects: student.academicInfo.electiveSubjects || [],
              selectedClass: student.academicInfo.selectedClass || "",
              classCapacity: student.academicInfo.classCapacity || 0,
            }
          : {
              coreSubjects: [],
              electiveSubjects: [],
              selectedClass: "",
              classCapacity: 0,
            },
      guardianInfo:
        student.guardianInfo && Object.keys(student.guardianInfo).length > 0
          ? {
              guardianName: student.guardianInfo.guardianName || "",
              relationship: student.guardianInfo.relationship || "",
              phoneNumber: student.guardianInfo.phoneNumber || "",
              whatsappNumber: student.guardianInfo.whatsappNumber || "",
              email: student.guardianInfo.email || "",
            }
          : {
              guardianName: "",
              relationship: "",
              phoneNumber: "",
              whatsappNumber: "",
              email: "",
            },
    }));

    return NextResponse.json(formattedStudents, { status: 200 });
  } catch (error) {
    console.error("Error fetching all students data:", error);
    return NextResponse.json(
      { message: "Failed to fetch all students data" },
      { status: 500 }
    );
  }
}
