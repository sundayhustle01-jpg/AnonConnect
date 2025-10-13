
import ChatAppClientWrapper from './chat-client';

export default function ChatPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const initialStranger = searchParams.stranger ? JSON.parse(decodeURIComponent(searchParams.stranger as string)) : null;
    const initialFilters = searchParams.filters ? decodeURIComponent(searchParams.filters as string) : null;

    return <ChatAppClientWrapper initialStranger={initialStranger} initialFilters={initialFilters} />;
}
