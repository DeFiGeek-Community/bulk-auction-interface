import {
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
  erc20ABI,
} from "wagmi";
import { BigNumber, constants } from "ethers";
import { useState } from "react";

export default function useApprove({
  targetAddress,
  owner,
  spender,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  targetAddress: `0x${string}` | null;
  owner: `0x${string}`;
  spender: `0x${string}`;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (e: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (e: Error) => void;
}): {
  prepareFn: any;
  writeFn: any;
  waitFn: ReturnType<typeof useWaitForTransaction>;
  allowance: BigNumber;
  refetchAllowance: () => Promise<any>;
} {
  const { chain } = useNetwork();
  const [allowance, setAllowance] = useState<BigNumber>(BigNumber.from(0));
  const approveArgs: [`0x${string}`, BigNumber] = [
    spender,
    BigNumber.from(constants.MaxUint256),
  ];
  const allowanceArgs: [`0x${string}`, `0x${string}`] = [owner, spender];
  const enabled: boolean = !!targetAddress && !!owner && !!spender && !!chain;

  const prepareFn = usePrepareContractWrite({
    chainId: chain?.id,
    address: targetAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
    args: approveArgs,
    enabled,
  });

  const writeFn = useContractWrite({
    ...prepareFn.config,
    onSuccess(data) {
      onSuccessWrite && onSuccessWrite(data);
    },
    onError(e: Error) {
      onErrorWrite && onErrorWrite(e);
    },
  });

  const waitFn = useWaitForTransaction({
    chainId: chain?.id,
    hash: writeFn.data?.hash,
    onSuccess(data) {
      onSuccessConfirm && onSuccessConfirm(data);
    },
    onError(e: Error) {
      onErrorConfirm && onErrorConfirm(e);
    },
  });

  const readFn = useContractRead({
    address: targetAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "allowance",
    args: allowanceArgs,
    enabled,
    onSuccess(data) {
      setAllowance(data);
    },
    watch: true,
  });

  return {
    prepareFn,
    writeFn,
    waitFn,
    allowance,
    refetchAllowance: readFn.refetch,
  };
}
