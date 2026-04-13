export async function signContractUseCase(contractId: string) {
  return {
    contractId,
    status: "SIGNED" as const,
    signedAt: new Date().toISOString(),
  };
}
