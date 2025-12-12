import Form from "@/components/Form";

export default function Page({ params }: { params: { token: string } }) {
  const token = params.token;

  // Validate token
  if (!token || token.trim() === "") {
    return (
      <div className="text-center text-red-600 text-xl py-10">
        Invalid or missing invite token. Please use the official confirmation link again.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Form token={token} />
    </div>
  );
}
