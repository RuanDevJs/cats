import axios, { AxiosRequestConfig } from "axios";
import React, { useEffect, useRef, useState } from "react";

interface useAxiosProps<T> {
  data: T | null;
  loading: boolean;
  error: null | string;
}

export default function useAxios<T>(
  url: string,
  options?: AxiosRequestConfig
): useAxiosProps<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios(url, options);
        if (response && response.data !== null) {
          setData(response.data.results);
        } else {
          throw new Error("Error on function fetchData: " + response.status);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(`Error: ${error.message}`);
          throw new Error("Error on function fetchData: " + error.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url]);

  return {
    data,
    error,
    loading,
  };
}
