interface ErrorProps {
  title: string;
  message: string;
}

export const Error = ({ title, message }: ErrorProps) => {
  return (
    <div className="p-4 border border-red-500 bg-red-100 text-red-700 rounded">
      <h2 className="text-lg font-semibold mb-2">
        {title || "An error occurred"}
      </h2>
      <p>{message || "Something went wrong. Please try again later."}</p>
    </div>
  );
};
