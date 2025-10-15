
import ChatAppClientWrapper from './chat-client';

type PageProps = {
    params: { [key: string]: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export default function ChatPage({ searchParams }: PageProps) {
    const initialStranger = searchParams.stranger ? JSON.parse(decodeURIComponent(searchParams.stranger as string)) : null;
    const initialFilters = searchParams.filters ? decodeURIComponent(searchParams.filters as string) : null;

    return <ChatAppClientWrapper initialStranger={initialStranger} initialFilters={initialFilters} />;
}
