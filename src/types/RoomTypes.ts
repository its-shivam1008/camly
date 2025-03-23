export interface UserData {
  id: string;
  role: "STUDENT" | "TEACHER";
  email: string;
}

export interface Producer {
  id: string;
  kind: "audio" | "video";
  pause: () => void;
  resume: () => void;
  close: () => void;
}

export interface Consumer {
  id: string;
  producerId: string;
  track: MediaStreamTrack;
  close: () => void;
}

export interface Transport {
  id: string;
  close: () => void;
  produce: (params: { track: MediaStreamTrack }) => Promise<Producer>;
  consume: (params: {
    id: string;
    producerId: string;
    kind: string;
    rtpParameters: any;
  }) => Promise<Consumer>;
  on: (event: string, callback: (...args: any[]) => void) => void;
}