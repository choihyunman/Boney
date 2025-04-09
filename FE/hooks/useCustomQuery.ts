import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";

type CustomQueryOptions<TData, TError> = {
  queryKey: UseQueryOptions<TData, TError>["queryKey"];
  queryFn: () => Promise<TData>;
  staleTime?: number;
  enabled?: boolean;
  refetchInterval?: number | false;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;

  onSuccessAction?: (data: TData) => void;
  onErrorAction?: (error: TError) => void;
};

export function useCustomQuery<TData, TError = Error>({
  queryKey,
  queryFn,
  staleTime,
  enabled,
  refetchInterval,
  refetchOnMount,
  refetchOnWindowFocus,
  onSuccessAction,
  onErrorAction,
}: CustomQueryOptions<TData, TError>): UseQueryResult<TData, TError> {
  const query = useQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime,
    enabled,
    refetchInterval,
    refetchOnMount,
    refetchOnWindowFocus,
  });

  useEffect(() => {
    if (query.isSuccess && query.data && onSuccessAction) {
      onSuccessAction(query.data);
    }
  }, [query.isSuccess, query.data, onSuccessAction]);

  useEffect(() => {
    if (query.isError && query.error && onErrorAction) {
      onErrorAction(query.error);
    }
  }, [query.isError, query.error, onErrorAction]);

  return query;
}
