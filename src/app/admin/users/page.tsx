const admins = [
  { name: "Store Admin", email: "admin@zenostore.com", role: "ADMIN", status: "Active" }
];

export default function AdminUsersPage() {
  return (
    <main className="adminPage">
      <header className="adminTop">
        <div><p className="eyebrow">ACCESS CONTROL</p><h1>Admin users</h1><p>Manage who can access the store dashboard.</p></div>
        <button className="adminAction">+ Add admin</button>
      </header>
      <div className="adminTable">
        <div className="tableRow tableHead"><span>User</span><span>Email</span><span>Role</span><span>Status</span></div>
        {admins.map((admin) => <div className="tableRow" key={admin.email}><strong>{admin.name}</strong><span>{admin.email}</span><span>{admin.role}</span><span>{admin.status}</span></div>)}
      </div>
    </main>
  );
}
