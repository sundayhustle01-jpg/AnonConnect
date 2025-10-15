
import ChatAppClientWrapper from './chat-client';

// The PageProps type is removed to avoid conflict with Next.js's auto-generated types.
// The props are typed inline in the function signature instead.
export default function ChatPage({
  searchParams,
}: {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const initialStranger = searchParams.stranger
    ? JSON.parse(decodeURIComponent(searchParams.stranger as string))
    : null;
  const initialFilters = searchParams.filters
    ? decodeURIComponent(searchParams.filters as string)
    : null;

  return (
    <ChatAppClientWrapper
      initialStranger={initialStranger}
      initialFilters={initialFilters}
    />
  );
}
