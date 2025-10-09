import React, { useEffect, useState } from "react";

interface GC1DPPProps {
  ulid: string;
}

const GC1DPP: React.FC<GC1DPPProps> = ({ ulid }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/dpp/${ulid}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        console.log(responseData);
        setData(responseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ulid]);

  if (loading) {
    return <div>{"Loading..."}</div>;
  }

  if (error) {
    return <div>{`Error: ${error}`}</div>;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default GC1DPP;
