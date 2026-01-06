
import { SuspenseSidebar } from "@/components/layout/SuspenseSidebar";

export default function WizardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <SuspenseSidebar />
            <div className="flex-1 flex flex-col w-full overflow-hidden">
                {children}
            </div>
        </div>
    );
}
