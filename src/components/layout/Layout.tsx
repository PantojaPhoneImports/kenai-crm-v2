import Sidebar from "./Sidebar";
import Header from "./Header";

interface Props {
  children: React.ReactNode;
}

export default function Layout({
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-zinc-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header />

        <main className="p-8">
          {children}
        </main>

      </div>

    </div>
  );
}