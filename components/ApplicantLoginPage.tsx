import Image from "next/image";

interface ApplicantLoginPageProps {
  onRecoverLink: () => void;
  onLogin: (indexNumber: string, pin: string) => void;
}

export default function ApplicantLoginPage({
  onRecoverLink,
  onLogin,
}: ApplicantLoginPageProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const indexNumber = (
      form.elements.namedItem("indexNumber") as HTMLInputElement
    ).value;
    const pin = (form.elements.namedItem("pin") as HTMLInputElement).value;
    onLogin(indexNumber, pin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="text-center mb-6">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pesco-ypQANIO5MV7swwJQueIYrxVza3zlu1.jpg"
            alt="Peki Senior High School Logo"
            width={80}
            height={80}
            className="mx-auto mb-2"
          />
          <h2 className="text-2xl font-bold">Applicant Login</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="indexNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Index Number
            </label>
            <input
              type="text"
              id="indexNumber"
              name="indexNumber"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your index number"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="pin"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              PIN
            </label>
            <input
              type="password"
              id="pin"
              name="pin"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your PIN"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <a
            href="#"
            className="text-sm text-blue-600 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              onRecoverLink();
            }}
          >
            Recover Login Details
          </a>
        </div>
      </div>
    </div>
  );
}
