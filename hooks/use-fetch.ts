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


import { useState } from "react";
import { toast } from "sonner";

const useFetch = <T, Args extends any[]>(cb: (...args: Args) => Promise<T>) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: Args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (err: any) {
      setError(err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
