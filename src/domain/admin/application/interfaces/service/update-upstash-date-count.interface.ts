export interface UpdateUpstashDateCountInput {
  date: string;
}

export interface FindLastDateOutput {
  last_email_date: string;
  days_remaining: number;
}
