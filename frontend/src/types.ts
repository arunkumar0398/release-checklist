export type ReleaseStatus = "planned" | "ongoing" | "done";

export interface Step {
  index: number;
  label: string;
  completed: boolean;
}

export interface Release {
  id: string;
  name: string;
  date: string;
  additionalInfo: string | null;
  status: ReleaseStatus;
  steps: Step[];
  createdAt: string;
  updatedAt: string;
}
