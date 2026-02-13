/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import * as ReactUnityWebGL from "react-unity-webgl";
import { useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { config } from "./config";
import { MsgUserType } from "./utils/interfaces";

type UnityContext = any;

export interface BettedUserType {
  name: string;
  betAmount: number;
  cashOut: number;
  cashouted: boolean;
  target: number;
  img: string;
  avatar: string;
}

export interface UserType {
  balance: number;
  userType: boolean;
  img: string;
  avatar: string;
  userId: string;
  currency: string;
  userName: string;
  ipAddress: string;
  platform: string;
  token: string;
  Session_Token: string;
  isSoundEnable: boolean;
  isMusicEnable: boolean;
  msgVisible: boolean;
  f: {
    auto: boolean;
    autocashout: boolean;
    betid: string;
    betted: boolean;
    cashouted: boolean;
    betAmount: number;
    cashAmount: number;
    target: number;
  };
  s: {
    auto: boolean;
    autocashout: boolean;
    betid: string;
    betted: boolean;
    cashouted: boolean;
    betAmount: number;
    cashAmount: number;
    target: number;
  };
}

export interface PlayerType {
  auto: boolean;
  betted: boolean;
  cashouted: boolean;
  betAmount: number;
  cashAmount: number;
  target: number;
}

interface GameStatusType {
  currentNum: number;
  currentSecondNum: number;
  GameState: string;
  time: number;
}

interface GameBetLimit {
  maxBet: number;
  minBet: number;
}

export interface GameHistory {
  _id: number;
  name: string;
  betAmount: number;
  cashoutAt: number;
  cashouted: boolean;
  createdAt: string;
  flyAway: number;
  flyDetailID: number;
  date: number;
}

interface UserStatusType {
  fbetState: boolean;
  sbetState: boolean;
}

interface UserStatusExtendedType extends UserStatusType {
  fbetted: boolean;
  sbetted: boolean;
}

interface ContextDataType {
  myBets: GameHistory[];
  width: number;
  seed: string;
  userInfo: UserType;
  fautoCashoutState: boolean;
  fautoCound: number;
  finState: boolean;
  fdeState: boolean;
  fsingle: boolean;
  fincrease: number;
  fdecrease: number;
  fsingleAmount: number;
  fdefaultBetAmount: number;
  sautoCashoutState: boolean;
  sautoCound: number;
  sincrease: number;
  sdecrease: number;
  ssingleAmount: number;
  sinState: boolean;
  sdeState: boolean;
  ssingle: boolean;
  sdefaultBetAmount: number;
  myUnityContext: UnityContext;
}

interface ContextType extends GameBetLimit, UserStatusExtendedType, GameStatusType {
  state: ContextDataType;
  userInfo: UserType;
  socket: Socket;
  msgData: MsgUserType[];
  platformLoading: boolean;
  msgTab: boolean;
  errorBackend: boolean;
  unityState: boolean;
  unityLoading: boolean;
  currentProgress: number;
  bettedUsers: BettedUserType[];
  previousHand: UserType[];
  history: number[];
  rechargeState: boolean;
  secure: boolean;
  msgReceived: boolean;
  myUnityContext: UnityContext;
  currentTarget: number;
  fLoading: boolean;
  sLoading: boolean;
  setFLoading(attrs: boolean): void;
  setSLoading(attrs: boolean): void;
  setCurrentTarget(attrs: number): void;
  setMsgReceived(attrs: boolean): void;
  update(attrs: Partial<ContextDataType>): void;
  updateUserInfo(attrs: Partial<UserType>): void;
  getMyBets(): void;
  updateUserBetState(attrs: Partial<UserStatusType>): void;
  setMsgData(attrs: MsgUserType[]): void;
  handleGetSeed(): void;
  handleGetSeedOfRound(attrs: number): Promise<any>;
  handlePlaceBet(): void;
  toggleMsgTab(): void;
  handleChangeUserSeed(attrs: string): void;
}

const unityContext = new (ReactUnityWebGL as any).UnityContext({
  loaderUrl: "unity/AirCrash.loader.js",
  dataUrl: "unity/AirCrash.data.unityweb",
  frameworkUrl: "unity/AirCrash.framework.js.unityweb",
  codeUrl: "unity/AirCrash.wasm.unityweb",
});

const init_userInfo_val = {
  balance: 0,
  userType: false,
  userId: "",
  avatar: "",
  img: "",
  userName: "",
  ipAddress: "",
  platform: "desktop",
  token: '',
  Session_Token: '',
  currency: "INR",
  isSoundEnable: false,
  isMusicEnable: false,
  msgVisible: false,
  f: {
    auto: false,
    autocashout: false,
    betid: '0',
    betted: false,
    cashouted: false,
    cashAmount: 0,
    betAmount: 20,
    target: 2,
  },
  s: {
    auto: false,
    autocashout: false,
    betid: '0',
    betted: false,
    cashouted: false,
    cashAmount: 0,
    betAmount: 20,
    target: 2,
  },
};

const init_state = {
  myBets: [],
  width: 1500,
  seed: "",
  userInfo: init_userInfo_val,
  fautoCashoutState: false,
  fautoCound: 0,
  finState: false,
  fdeState: false,
  fsingle: false,
  fincrease: 0,
  fdecrease: 0,
  fsingleAmount: 0,
  fdefaultBetAmount: 20,
  sautoCashoutState: false,
  sautoCound: 0,
  sincrease: 0,
  sdecrease: 0,
  ssingleAmount: 0,
  sinState: false,
  sdeState: false,
  ssingle: false,
  sdefaultBetAmount: 20,
  myUnityContext: unityContext,
} as ContextDataType;

const Context = React.createContext<ContextType>(null!);
const socket = io(config.wss);

export const callCashOut = (at: number, index: "f" | "s") => {
  let data = { type: index, endTarget: at };
  socket.emit("cashOut", data);
};

export const Provider = ({ children }: any) => {
  const token = new URLSearchParams(useLocation().search).get("cert");
  const [state, setState] = React.useState<ContextDataType>(init_state);
  const [unity, setUnity] = React.useState({
    unityState: false,
    unityLoading: false,
    currentProgress: 0,
  });
  const [gameState, setGameState] = React.useState({
    currentNum: 0,
    currentSecondNum: 0,
    GameState: "",
    time: 0,
  });

  const [userInfo, setUserInfo] = React.useState<UserType>(init_userInfo_val);
  const [msgData, setMsgData] = React.useState<MsgUserType[]>([]);
  const [msgTab, setMsgTab] = React.useState(false);
  const [msgReceived, setMsgReceived] = React.useState(false);
  const [fLoading, setFLoading] = React.useState(false);
  const [sLoading, setSLoading] = React.useState(false);
  const [errorBackend, setErrorBackend] = React.useState(false);
  const [secure, setSecure] = React.useState(true);
  const [platformLoading, setPlatformLoading] = React.useState(false);
  const [bettedUsers, setBettedUsers] = React.useState<BettedUserType[]>([]);
  const [previousHand, setPreviousHand] = React.useState<UserType[]>([]);
  const [history, setHistory] = React.useState<number[]>([]);
  const [userBetState, setUserBetState] = React.useState<UserStatusType>({
    fbetState: false,
    sbetState: false,
  });
  const [internalBetted, setInternalBetted] = React.useState({ fbetted: false, sbetted: false });
  const [rechargeState, setRechargeState] = React.useState(false);
  const [currentTarget, setCurrentTarget] = React.useState(0);
  const [betLimit, setBetLimit] = React.useState<GameBetLimit>({
    maxBet: 1000,
    minBet: 1,
  });

  const update = (attrs: Partial<ContextDataType>) => {
    setState(prev => ({ ...prev, ...attrs }));
  };

  const updateUserInfo = (attrs: Partial<UserType>) => {
    setUserInfo(prev => ({ ...prev, ...attrs }));
  };

  const toggleMsgTab = () => setMsgTab(!msgTab);

  const handleChangeUserSeed = (seed: string) => {
    update({ seed });
  };

  const handleGetSeed = () => {};

  const handleGetSeedOfRound = async (id: number) => {
    try {
      const response = await fetch(`${config.api}/get-seed-of-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handlePlaceBet = () => {};

  const updateUserBetState = (attrs: Partial<UserStatusType>) => {
    setUserBetState(prev => ({ ...prev, ...attrs }));
  };

  const getMyBets = async () => {
    try {
      const response = await fetch(`${config.api}/my-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userInfo.userName }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          update({ myBets: data.data as GameHistory[] });
        }
      }
    } catch (error) {
      console.log("getMyBets", error);
    }
  };

  useEffect(() => {
    unityContext.on("GameController", function (message) {
      if (message === "Ready") {
        setUnity({ currentProgress: 100, unityLoading: true, unityState: true });
      }
    });
    unityContext.on("progress", (progression) => {
      const currentProgress = progression * 100;
      if (progression === 1) {
        setUnity({ currentProgress, unityLoading: true, unityState: true });
      } else {
        setUnity({ currentProgress, unityLoading: false, unityState: false });
      }
    });
    return () => unityContext.removeAllEventListeners();
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("enterRoom", { token });
    });
    socket.on("bettedUserInfo", (users: BettedUserType[]) => setBettedUsers(users));
    socket.on("myBetState", (user: UserType) => {
      setUserBetState({ fbetState: false, sbetState: false });
      setInternalBetted({ fbetted: user.f.betted, sbetted: user.s.betted });
    });
    socket.on("myInfo", (user: UserType) => {
      setUserInfo(user);
      update({ userInfo: user });
    });
    socket.on("history", (hist: any) => setHistory(hist));
    socket.on("gameState", (gState: any) => setGameState(gState));
    socket.on("previousHand", (prev: UserType[]) => setPreviousHand(prev));
    socket.on("getBetLimits", (limits: { max: number; min: number }) => {
      setBetLimit({ maxBet: limits.max, minBet: limits.min });
    });
    socket.on("recharge", () => setRechargeState(true));
    socket.on("error", (data) => toast.error(data.message));
    socket.on("success", (data) => toast.success(data));

    return () => {
      socket.off("connect");
      socket.off("bettedUserInfo");
      socket.off("myBetState");
      socket.off("myInfo");
      socket.off("history");
      socket.off("gameState");
      socket.off("previousHand");
      socket.off("getBetLimits");
      socket.off("recharge");
      socket.off("error");
      socket.off("success");
    };
  }, []);

  return (
    <Context.Provider
      value={{
        state,
        userInfo,
        socket,
        msgData,
        platformLoading,
        msgTab,
        errorBackend,
        secure,
        msgReceived,
        fLoading,
        sLoading,
        setFLoading,
        setSLoading,
        setMsgReceived,
        updateUserInfo,
        setMsgData,
        handleGetSeed,
        handleGetSeedOfRound,
        handlePlaceBet,
        toggleMsgTab,
        handleChangeUserSeed,
        ...betLimit,
        ...userBetState,
        fbetted: internalBetted.fbetted,
        sbetted: internalBetted.sbetted,
        ...unity,
        ...gameState,
        currentTarget,
        rechargeState,
        myUnityContext: unityContext,
        bettedUsers: [...bettedUsers],
        previousHand: [...previousHand],
        history: [...history],
        setCurrentTarget,
        update,
        getMyBets,
        updateUserBetState,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default Context;