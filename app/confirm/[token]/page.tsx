import Form from "@/components/Form";

export default function Page({
  params
}: {
  params: { token: string };
}) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Form token={params.token} />
    </div>
  );
}
