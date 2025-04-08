import axios from "axios";

// 현재 날짜와 시간을 YYYYMMDD, HHMMSS 형식으로 반환하는 함수
const getCurrentDateTime = () => {
  // 한국 시간으로 설정 (UTC+9)
  const now = new Date();
  const koreanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  // YYYYMMDD 형식
  const year = koreanTime.getUTCFullYear();
  const month = String(koreanTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(koreanTime.getUTCDate()).padStart(2, "0");
  const transmissionDate = `${year}${month}${day}`;

  // HHMMSS 형식 (24시간 형식)
  const hours = String(koreanTime.getUTCHours()).padStart(2, "0");
  const minutes = String(koreanTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(koreanTime.getUTCSeconds()).padStart(2, "0");
  const transmissionTime = `${hours}${minutes}${seconds}`;

  // 디버깅을 위한 로그
  console.log("Generated DateTime:", { transmissionDate, transmissionTime });

  return { transmissionDate, transmissionTime };
};

// 고유한 거래 번호 생성 함수 (20자리 숫자)
const generateTransactionUniqueNo = () => {
  // 현재 시간을 밀리초 단위로 가져옴 (13자리)
  const timestamp = Date.now();

  // 0-9999999 사이의 난수를 생성하고 7자리로 패딩
  const random = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0");

  // timestamp(13) + random(7) = 20자리 숫자
  return `${timestamp}${random}`;
};

// 결제 API 호출 함수
export const processPayment = async (
  itemName: string,
  itemPrice: number,
  accountNo: string
) => {
  try {
    const { transmissionDate, transmissionTime } = getCurrentDateTime();
    const institutionTransactionUniqueNo = generateTransactionUniqueNo();

    const requestBody = {
      Header: {
        apiName: "updateDemandDepositAccountWithdrawal",
        transmissionDate,
        transmissionTime,
        institutionCode: "00100",
        fintechAppNo: "001",
        apiServiceCode: "updateDemandDepositAccountWithdrawal",
        institutionTransactionUniqueNo,
        apiKey: "953bd1ca18c748a4b88b2b6449c30000",
        userKey: "eb29c6fe-771e-4237-a3d7-c203cfd7830c",
      },
      accountNo,
      transactionBalance: itemPrice.toString(),
      transactionSummary: itemName,
    };

    console.log("결제 요청 바디:", JSON.stringify(requestBody, null, 2));

    const response = await axios.post(
      "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/updateDemandDepositAccountWithdrawal",
      requestBody
    );

    console.log("결제 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("결제 처리 중 오류 발생:", error);
    if (axios.isAxiosError(error)) {
      console.error("에러 응답:", error.response?.data);
    }
    throw error;
  }
};
