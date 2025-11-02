
import ChatPanel from "@/components/Chat/ChatPanel";

export default function Chat() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-6">
      <h1 className="text-2xl font-semibold">Ask the Portal</h1>
      <div className="mt-4">
        <ChatPanel />
      </div>
    </div>
  );
}
