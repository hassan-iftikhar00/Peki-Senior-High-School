// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function generateAndStoreCredentials(
//   indexNumber: string,
//   phoneNumber: string
// ) {
//   const serial = Math.random().toString(36).substr(2, 8).toUpperCase();
//   const password = Math.random().toString(36).substr(2, 8);

//   await prisma.applicant.upsert({
//     where: { indexNumber: indexNumber },
//     update: {
//       serial: serial,
//       password: password,
//       phoneNumber: phoneNumber,
//     },
//     create: {
//       indexNumber: indexNumber,
//       serial: serial,
//       password: password,
//       phoneNumber: phoneNumber,
//     },
//   });

//   return { serial, password };
// }

// export async function validateCredentials(
//   indexNumber: string,
//   serial: string,
//   password: string
// ) {
//   const applicant = await prisma.applicant.findUnique({
//     where: {
//       indexNumber: indexNumber,
//       serial: serial,
//       password: password,
//     },
//   });

//   return !!applicant;
// }
