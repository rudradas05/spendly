// import { useState } from "react";
// import { toast } from "sonner";


// const useFetch = (cb: any) => {
//   const [data, setData] = useState(undefined);
//   const [loading, setLoading] = useState(null);
//   const [error, setError] = useState(null);

//   const fn = async (...args)=>{
//     setLoading (true);
//     setError (null);
//     try {
//         const response = await cb(...args);
//         setData(response);
//         setError(null);
//     } catch (error) {
//         setError(error);
//         toast.error(error.message)
//     }finally{
//         setLoading(false);
//     }
//   }
//   return {data, loading, error, fn, setData};
// };
// export default useFetch;


"use client";

import { useState } from "react";
import { toast } from "sonner";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

const useFetch = <T, Args extends unknown[]>(
  cb: (...args: Args) => Promise<T>
) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: Args): Promise<T | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const response = await cb(...args);
      setData(response);
      return response;
    } catch (err: unknown) {
      const normalizedError =
        err instanceof Error ? err : new Error(getErrorMessage(err));
      setError(normalizedError);
      toast.error(normalizedError.message);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
