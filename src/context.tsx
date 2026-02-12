/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
// Fix: Use any for UnityContext to bypass version-specific import errors and handle potential missing export
import * as ReactUnityWebGL from "react-unity-webgl";
import { useLocation } from "react-router";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { config } from "./config";
import { MsgUserType } from "./utils/interfaces";

// Fix: Define UnityContext as any to support both v8 and v9+ usage patterns during version transition
type UnityContext = any;

// Updated BettedUserType to include avatar and name fields as expected by components
export interface BettedUserType {
  name: string;
  betAmount: number;
  cashOut: number;
  cashouted: boolean;
  target: number;
  img: string;
  avatar: string;
}

// Updated UserType to include all fields required by header, settings, and other components
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

// Updated GameHistory to include fields used in MyBets component
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

// Fix: Simplified UserStatusType to only include common state flags, removing properties handled separately in Provider
interface UserStatusType {
  fbetState: boolean;
  sbetState: boolean;
}

interface UserStatusExtendedType extends UserStatusType {
  fbetted: boolean;
  sbetted: boolean;
}

// Added seed property to ContextDataType as required by SettingsMenu
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

// Expanded ContextType to include all properties and methods used by components across the app
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

// Fix: Dynamically access UnityContext from the module if available, otherwise use any for legacy v8 support
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

let fIncreaseAmount = 0;
let fDecreaseAmount = 0;
let sIncreaseAmount = 0;
let sDecreaseAmount = 0;

let newState;
let newBetState;

export const Provider = ({ children }: any) => {
  const token = new URLSearchParams(useLocation().search).get("cert");
  const [state, setState] = React.useState<ContextDataType>(init_state);

  newState = state;
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
  const update = (attrs: Partial<ContextDataType>) => {
    setState({ ...state, ...attrs });
  };

  const updateUserInfo = (attrs: Partial<UserType>) => {
    setUserInfo(prev => ({ ...prev, ...attrs }));
  };

  const toggleMsgTab = () => setMsgTab(!msgTab);

  const handleChangeUserSeed = (seed: string) => {
    update({ seed });
  };

  const handleGetSeed = () => {
    // Logic for handleGetSeed if needed
  };

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

  const handlePlaceBet = () => {
    // Logic for handlePlaceBet if needed
  };

  const [previousHand, setPreviousHand] = React.useState<UserType[]>([]);
  const [history, setHistory] = React.useState<number[]>([]);
  const [userBetState, setUserBetState] = React.useState<UserStatusType>({
    fbetState: false,
    sbetState: false,
  });
  // Using userBetState properties but tracking fbetted/sbetted internally if needed for the Provider logic
  const [internalBetted, setInternalBetted] = React.useState({ fbetted: false, sbetted: false });
  
  newBetState = userBetState;
  const [rechargeState, setRechargeState] = React.useState(false);
  const [currentTarget, setCurrentTarget] = React.useState(0);
  const updateUserBetState = (attrs: Partial<UserStatusType>) => {
    setUserBetState({ ...userBetState, ...attrs });
  };

  const [betLimit, setBetLimit] = React.useState<GameBetLimit>({
    maxBet: 1000,
    minBet: 1,
  });
  React.useEffect(function () {
    unityContext.on("GameController", function (message) {
      if (message === "Ready") {
        setUnity({
          currentProgress: 100,
          unityLoading: true,
          unityState: true,
        });
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

  React.useEffect(() => {
    socket.on("connect", () => {
      socket.emit("enterRoom", { token });
    });

    socket.on("bettedUserInfo", (bettedUsers: BettedUserType[]) => {
      setBettedUsers(bettedUsers);
    });

    socket.on("myBetState", (user: UserType) => {
      setUserBetState({
        fbetState: false,
        sbetState: false,
      });
      setInternalBetted({
        fbetted: user.f.betted,
        sbetted: user.s.betted
      });
    });

    socket.on("myInfo", (user: UserType) => {
      setUserInfo(user);
      let attrs = state;
      attrs.userInfo = user;
      update(attrs);
    });

    socket.on("history", (history: any) => {
      setHistory(history);
    });

    socket.on("gameState", (gameState: GameStatusType) => {
      setGameState(gameState);
    });

    socket.on("previousHand", (previousHand: UserType[]) => {
      setPreviousHand(previousHand);
    });

    socket.on("finishGame", (user: UserType) => {
      let attrs = newState;
      let fauto = attrs.userInfo.f.auto;
      let sauto = attrs.userInfo.s.auto;
      let fbetAmount = attrs.userInfo.f.betAmount;
      let sbetAmount = attrs.userInfo.s.betAmount;
      let betStatus = { ...newBetState };
      attrs.userInfo = user;
      attrs.userInfo.f.betAmount = fbetAmount;
      attrs.userInfo.s.betAmount = sbetAmount;
      attrs.userInfo.f.auto = fauto;
      attrs.userInfo.s.auto = sauto;
      
      let newInternalBetted = { fbetted: user.f.betted, sbetted: user.s.betted };

      if (!user.f.betted) {
        newInternalBetted.fbetted = false;
        if (attrs.userInfo.f.auto) {
          if (user.f.cashouted) {
            fIncreaseAmount += user.f.cashAmount;
            if (attrs.finState && attrs.fincrease - fIncreaseAmount <= 0) {
              attrs.userInfo.f.auto = false;
              betStatus.fbetState = false;
              fIncreaseAmount = 0;
            } else if (
              attrs.fsingle &&
              attrs.fsingleAmount <= user.f.cashAmount
            ) {
              attrs.userInfo.f.auto = false;
              betStatus.fbetState = false;
            } else {
              attrs.userInfo.f.auto = true;
              betStatus.fbetState = true;
            }
          } else {
            fDecreaseAmount += user.f.betAmount;
            if (attrs.fdeState && attrs.fdecrease - fDecreaseAmount <= 0) {
              attrs.userInfo.f.auto = false;
              betStatus.fbetState = false;
              fDecreaseAmount = 0;
            } else {
              attrs.userInfo.f.auto = true;
              betStatus.fbetState = true;
            }
          }
        }
      }
      if (!user.s.betted) {
        newInternalBetted.sbetted = false;
        if (user.s.auto) {
          if (user.s.cashouted) {
            sIncreaseAmount += user.s.cashAmount;
            if (attrs.sinState && attrs.sincrease - sIncreaseAmount <= 0) {
              attrs.userInfo.s.auto = false;
              betStatus.sbetState = false;
              sIncreaseAmount = 0;
            } else if (
              attrs.ssingle &&
              attrs.ssingleAmount <= user.s.cashAmount
            ) {
              attrs.userInfo.s.auto = false;
              betStatus.sbetState = false;
            } else {
              attrs.userInfo.s.auto = true;
              betStatus.sbetState = true;
            }
          } else {
            sDecreaseAmount += user.s.betAmount;
            if (attrs.sdeState && attrs.sdecrease - sDecreaseAmount <= 0) {
              attrs.userInfo.s.auto = false;
              betStatus.sbetState = false;
              sDecreaseAmount = 0;
            } else {
              attrs.userInfo.s.auto = true;
              betStatus.sbetState = true;
            }
          }
        }
      }
      update(attrs);
      setUserBetState(betStatus);
      setInternalBetted(newInternalBetted);
    });

    socket.on("getBetLimits", (betAmounts: { max: number; min: number }) => {
      setBetLimit({ maxBet: betAmounts.max, minBet: betAmounts.min });
    });

    socket.on("recharge", () => {
      setRechargeState(true);
    });

    socket.on("error", (data) => {
      // Logic for handling socket error per index if needed
      toast.error(data.message);
    });

    socket.on("success", (data) => {
      toast.success(data);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("myBetState");
      socket.off("myInfo");
      socket.off("history");
      socket.off("gameState");
      socket.off("previousHand");
      socket.off("finishGame");
      socket.off("getBetLimits");
      socket.off("recharge");
      socket.off("error");
      socket.off("success");
    };
  }, [socket]);

  React.useEffect(() => {
    let attrs = state;
    let betStatus = { ...userBetState };
    if (gameState.GameState === "BET") {
      if (betStatus.fbetState) {
        if (state.userInfo.f.auto) {
          if (state.fautoCound > 0) attrs.fautoCound -= 1;
          else {
            attrs.userInfo.f.auto = false;
            betStatus.fbetState = false;
            return;
          }
        }
        let data = {
          betAmount: state.userInfo.f.betAmount,
          target: state.userInfo.f.target,
          type: "f",
          auto: state.userInfo.f.auto,
        };
        if (attrs.userInfo.balance - state.userInfo.f.betAmount < 0) {
          toast.error("Your balance is not enough");
          betStatus.fbetState = false;
          return;
        }
        attrs.userInfo.balance -= state.userInfo.f.betAmount;
        socket.emit("playBet", data);
        betStatus.fbetState = false;
        setUserBetState(betStatus);
      }
      if (betStatus.sbetState) {
        if (state.userInfo.s.auto) {
          if (state.sautoCound > 0) attrs.sautoCound -= 1;
          else {
            attrs.userInfo.s.auto = false;
            betStatus.sbetState = false;
            return;
          }
        }
        let data = {
          betAmount: state.userInfo.s.betAmount,
          target: state.userInfo.s.target,
          type: "s",
          auto: state.userInfo.s.auto,
        };
        if (attrs.userInfo.balance - state.userInfo.s.betAmount < 0) {
          toast.error("Your balance is not enough");
          betStatus.sbetState = false;
          return;
        }
        attrs.userInfo.balance -= state.userInfo.s.betAmount;
        socket.emit("playBet", data);
        betStatus.sbetState = false;
        setUserBetState(betStatus);
      }
    }
  }, [gameState.GameState, userBetState.fbetState, userBetState.sbetState]);

  const getMyBets = async () => {
    try {
      const response = await fetch(`${config.api}/my-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: state.userInfo.userName }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          update({ myBets: data.data as GameHistory[] });
        }
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.log("getMyBets", error);
    }
  };

  useEffect(() => {
    if (gameState.GameState === "BET") getMyBets();
  }, [gameState.GameState]);

  return (
    <Context.Provider
      value={{
        state: state,
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