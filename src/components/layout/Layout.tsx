import Sidebar from "./Sidebar";
import Header from "./Header";

interface Props {
  children: React.ReactNode;
}

export default function Layout({
  children,
}: Props) {
  return (
    <div className="flex min-h-screen min-w-0 bg-zinc-950">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Header />

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}
