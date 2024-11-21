import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";

const STORAGE_KEY = "applicationFormData";

export default function Sidebar() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem("isLoggedIn", "false");
      await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.setItem("isLoggedIn", "true"); // Revert on error
      // Optionally, notify the user of the error
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div
        className="sidebar"
        style={{
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          width: "280px",
          overflowY: "auto",
        }}
      >
        <div className="sidebar-header">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PO_logo_transparent-svdlDCdbELJnvXtecztMuFAiI1BudT.png"
            alt="Packets Out LLC Logo"
            width={40}
            height={40}
            className="sidebar-logo"
          />
          <strong className="sidebar-title">Packets Out LLC</strong>
        </div>

        <ul className="sidebar-menu">
          <li>
            <a href="#" className="inactive">
              <span>🔍</span> Index No. Verification
            </a>
          </li>
          <li>
            <a href="#" className="inactive">
              <span>🎫</span> Voucher Purchase
            </a>
          </li>
          <li>
            <a href="#personal-info">
              <span>👤</span> Personal Info.
            </a>
          </li>
          <li>
            <a href="#academic">
              <span>📚</span> Academic
            </a>
          </li>
          <li>
            <a href="#house">
              <span>🏠</span> House
            </a>
          </li>
          <li>
            <a href="#uploads">
              <span>📤</span> Uploads
            </a>
          </li>
          <li>
            <a href="#submit">
              <span>📨</span> Submit
            </a>
          </li>
          <li>
            <a href="#admission-documents">
              <span>📄</span> Admission Doc.
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={handleLogout}
              style={{ opacity: isLoggingOut ? 0.5 : 1 }}
            >
              <span>🚪</span> Logout
            </a>
          </li>
        </ul>
      </div>
      <LoadingOverlay message="Logging out..." isVisible={isLoggingOut} />
    </>
  );
}
