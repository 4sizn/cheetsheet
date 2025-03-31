import { Subject, BehaviorSubject, Observable, Subscription } from "rxjs";
import { takeWhile, concatMap, delay } from "rxjs/operators";

export class MessageQueue<T> {
  private messageSubject = new Subject<T>();
  private isRunningSubject = new BehaviorSubject<boolean>(false);
  private subscription: Subscription | null = null;
  private processingDelay: number;

  constructor(processingDelay: number = 1000) {
    this.processingDelay = processingDelay;
  }

  // 큐에 메시지 추가
  addMessage(message: T): void {
    this.messageSubject.next(message);
  }

  // 큐 시작
  start(): void {
    if (this.isRunningSubject.value) {
      return;
    }

    this.isRunningSubject.next(true);
    this.subscription = this.messageSubject
      .pipe(
        takeWhile(() => this.isRunningSubject.value),
        concatMap((message) =>
          new Observable((subscriber) => {
            subscriber.next(message);
            subscriber.complete();
          }).pipe(delay(this.processingDelay))
        )
      )
      .subscribe({
        next: (message) => {
          //메시지가 함수면 메시지 처리
          console.log("처리된 메시지:", message);
          if (typeof message === "function") {
            message();
          }
        },
        error: (error) => {
          console.error("에러 발생:", error);
          throw error;
        },
        complete: () => {},
      });
  }

  // 큐 중지
  stop(): void {
    this.isRunningSubject.next(false);
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  // 큐 상태 확인
  isRunning(): boolean {
    return this.isRunningSubject.value;
  }

  // 큐 정리
  dispose(): void {
    this.stop();
    this.messageSubject.complete();
    this.isRunningSubject.complete();
  }
}
