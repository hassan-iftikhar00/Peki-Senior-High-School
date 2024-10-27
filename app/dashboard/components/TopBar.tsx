import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function TopBar({ applicantName }: { applicantName: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <div
      className="top-bar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#f0f0f0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        className="school-name"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div className="TopBarItems">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pesco-ypQANIO5MV7swwJQueIYrxVza3zlu1.jpg"
            alt="Peki Senior High School Logo"
            width={40}
            height={40}
            className="school-logo"
          />
        </div>
        <div className="TopBarItems">
          <span style={{ fontWeight: "bold" }}> Peki Senior High School</span>
        </div>
      </div>
      <div
        className="user-info"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div className="TopBarItems">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blank-CRJbfovrhtk24KR2rQYdS4Fjnr2BpU.jpg"
            alt="User Avatar"
            width={32}
            height={32}
            className="user-avatar"
            style={{ borderRadius: "50%" }}
          />
        </div>
        <div
          className="TopBarItems"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>{applicantName}</span>
          <button
            onClick={handleLogout}
            className="logout-button"
            aria-label="Logout"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "5px",
              borderRadius: "5px",
              transition: "background-color 0.3s",
              color: "black",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#e0e0e0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
