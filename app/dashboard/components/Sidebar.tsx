import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="sidebar">
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
          <a href="#personal-i nfo">
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
          <a href="#admission- documents">
            <span>📄</span> Admission Doc.
          </a>
        </li>
        <li>
          <Link href="/" passHref>
            <span>🚪</span> Logout
          </Link>
        </li>
      </ul>
    </div>
  );
}
