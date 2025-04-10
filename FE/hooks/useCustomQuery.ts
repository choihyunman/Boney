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
  retry?: number | false;

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
  retry,
}: CustomQueryOptions<TData, TError>): UseQueryResult<TData, TError> {
  const query = useQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime,
    enabled,
    refetchInterval,
    refetchOnMount,
    refetchOnWindowFocus,
    retry, 
  });

  // 이전 데이터를 저장하는 ref
  const prevDataRef = useRef<TData | null>(null);

  useEffect(() => {
    if (query.isSuccess && query.data && onSuccessAction) {
      // 이전 데이터와 현재 데이터가 다른 경우에만 onSuccessAction 호출
      if (JSON.stringify(prevDataRef.current) !== JSON.stringify(query.data)) {
        prevDataRef.current = query.data;
        onSuccessAction(query.data);
      }
    }
  }, [query.isSuccess, query.data, onSuccessAction]);

  useEffect(() => {
    if (query.isError && query.error && onErrorAction) {
      onErrorAction(query.error);
    }
  }, [query.isError, query.error, onErrorAction]);

  return query;
}
