import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <span className="eyebrow">A LITTLE DETOUR</span>
      <h1 style={{ margin: "20px 0", fontSize: 44 }}>
        This page has wandered off.
      </h1>
      <p>There are plenty of lovely things back at the shop.</p>
      <Link href="/" className="button primary">
        Back to our little world
      </Link>
    </div>
  );
}
