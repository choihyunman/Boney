import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";

type CustomQueryOptions<TData, TError> = {
  queryKey: UseQueryOptions<TData, TError>["queryKey"];
  queryFn: () => Promise<TData>;
  staleTime?: number;

  onSuccessAction?: (data: TData) => void;
  onErrorAction?: (error: TError) => void;
};

export function useCustomQuery<TData, TError = Error>({
  queryKey,
  queryFn,
  staleTime = 1000 * 60 * 3,
  onSuccessAction,
  onErrorAction,
}: CustomQueryOptions<TData, TError>): UseQueryResult<TData, TError> {
  const query = useQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime,
  });

  useEffect(() => {
    if (query.isSuccess && query.data && onSuccessAction) {
      onSuccessAction(query.data);
    }
  }, [query.isSuccess, query.data, onSuccessAction]);

  useEffect(() => {
    if (query.isError && query.error) {
      if (onErrorAction) {
        onErrorAction(query.error);
      } else {
        console.error("❌ Query Error:", query.error);
      }
    }
  }, [query.isError, query.error, onErrorAction]);

  return query;
}
