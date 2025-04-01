from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pickle
import datetime, uvicorn

app = FastAPI()

class AnomalyRequest(BaseModel):
    transferId: int
    senderAccount: str
    recipientAccount: str
    amount: int
    createdAt: datetime.datetime
    averageTransactionAmount: float
    stdDevTransactionAmount: float
    amountRatio: float
    transactionCountLast10Minutes: int
    transactionCountLastHour: int
    timeGapMinutes: int
    newRecipientFlag: bool
    transactionHour: int
    transactionCategory: str

class AnomalyResponse(BaseModel):
    score: float
    anomaly: bool

# 모델 로딩 (학습된 IsolationForest 모델)
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

@app.post("/api/ai", response_model=AnomalyResponse)
def detect_anomaly(request: AnomalyRequest):
    # feature vector 순서는 모델 학습 시 사용한 순서와 동일해야 합니다.
    features = np.array([
        request.amount,
        request.averageTransactionAmount,
        request.stdDevTransactionAmount,
        request.amountRatio,
        request.transactionCountLast10Minutes,
        request.transactionCountLastHour,
        request.timeGapMinutes,
        float(request.newRecipientFlag),
        request.transactionHour,
        # 거래 카테고리 등 범주형 변수는 필요 시 인코딩 진행
    ]).reshape(1, -1)
    
    # IsolationForest의 decision_function 값 사용 (일반적으로 음수일수록 이상치)
    score = model.decision_function(features)[0]
    # 예시 임계치: score < -0.1이면 이상치로 간주
    anomaly = score < -0.09 
    return AnomalyResponse(score=score, anomaly=anomaly)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)