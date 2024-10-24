import Image from "next/image";

export default function TopBar({ applicantName }: { applicantName: string }) {
  return (
    <div className="top-bar">
      <div className="school-name">
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
          <span> Peki Senior High School</span>
        </div>
      </div>
      <div className="user-info">
        <div className="TopBarItems">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blank-CRJbfovrhtk24KR2rQYdS4Fjnr2BpU.jpg"
            alt="User Avatar"
            width={32}
            height={32}
            className="user-avatar"
          />
        </div>
        <div className="TopBarItems">
          <span>{applicantName}</span>
          <span className="logout-icon">🚪</span>
        </div>
      </div>
    </div>
  );
}
