/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { UnityContext } from "react-unity-webgl";
import { useLocation } from "react-router";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { config } from "./config";

export interface BettedUserType {
  name: string;
  betAmount: number;
  cashOut: number;
  cashouted: boolean;
  target: number;
  img: string;
}

export interface UserType {
  balance: number;
  userType: boolean;
  img: string;
  userName: string;
  f: {
    auto: boolean;
    betted: boolean;
    cashouted: boolean;
    betAmount: number;
    cashAmount: number;
    target: number;
  };
  s: {
    auto: boolean;
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

declare interface GameHistory {
  _id: number;
  name: string;
  betAmount: number;
  cashoutAt: number;
  cashouted: boolean;
  date: number;
}

interface UserStatusType {
  fbetState: boolean;
  fbetted: boolean;
  sbetState: boolean;
  sbetted: boolean;
}

interface ContextDataType {
  myBets: GameHistory[];
  width: number;
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

interface ContextType extends GameBetLimit, UserStatusType, GameStatusType {
  state: ContextDataType;
  unityState: boolean;
  unityLoading: boolean;
  currentProgress: number;
  bettedUsers: BettedUserType[];
  previousHand: UserType[];
  history: number[];
  rechargeState: boolean;
  myUnityContext: UnityContext;
  currentTarget: number;
  setCurrentTarget(attrs: Partial<number>);
  update(attrs: Partial<ContextDataType>);
  getMyBets();
  updateUserBetState(attrs: Partial<UserStatusType>);
}

const unityContext = new UnityContext({
  loaderUrl: "/unity/AirCrash.loader.js",
  dataUrl: "/unity/AirCrash.data.unityweb",
  frameworkUrl: "/unity/AirCrash.framework.js.unityweb",
  codeUrl: "/unity/AirCrash.wasm.unityweb",
});

const init_state = {
  myBets: [],
  width: 1500,
  userInfo: {
    balance: 0,
    userType: false,
    img: "",
    userName: "",
    f: {
      auto: false,
      betted: false,
      cashouted: false,
      cashAmount: 0,
      betAmount: 20,
      target: 2,
    },
    s: {
      auto: false,
      betted: false,
      cashouted: false,
      cashAmount: 0,
      betAmount: 20,
      target: 2,
    },
  },
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

export const callCashOut = (at: number, index: \"f\" | \"s\") => {
  let data = { type: index, endTarget: at };
  socket.emit(\"cashOut\", data);
};

let fIncreaseAmount = 0;
let fDecreaseAmount = 0;
let sIncreaseAmount = 0;
let sDecreaseAmount = 0;

let newState;
let newBetState;

export const Provider = ({ children }: any) => {
  const token = new URLSearchParams(useLocation().search).get(\"cert\");
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
    GameState: \"\",
    time: 0,
  });

  const [bettedUsers, setBettedUsers] = React.useState<BettedUserType[]>([]);
  const update = (attrs: Partial<ContextDataType>) => {
    setState({ ...state, ...attrs });
  };
  const [previousHand, setPreviousHand] = React.useState<UserType[]>([]);
  const [history, setHistory] = React.useState<number[]>([]);
  const [userBetState, setUserBetState] = React.useState<UserStatusType>({
    fbetState: false,
    fbetted: false,
    sbetState: false,
    sbetted: false,
  });
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
    unityContext.on(\"GameController\", function (message) {
      if (message === \"Ready\") {
        setUnity({
          currentProgress: 100,
          unityLoading: true,
          unityState: true,
        });
      }
    });
    unityContext.on(\"progress\", (progression) => {
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
    socket.on(\"connect\", () => {
      socket.emit(\"enterRoom\", { token });
    });

    socket.on(\"bettedUserInfo\", (bettedUsers: BettedUserType[]) => {
      setBettedUsers(bettedUsers);
    });

    socket.on(\"connect\", () => {
      console.log(socket.connected);
    });

    socket.on(\"myBetState\", (user: UserType) => {
      const attrs = userBetState;
      attrs.fbetState = false;
      attrs.fbetted = user.f.betted;
      attrs.sbetState = false;
      attrs.sbetted = user.s.betted;
      setUserBetState(attrs);
    });

    socket.on(\"myInfo\", (user: UserType) => {
      let attrs = state;
      attrs.userInfo.balance = user.balance;
      attrs.userInfo.userType = user.userType;
      attrs.userInfo.userName = user.userName;
      update(attrs);
    });

    socket.on(\"history\", (history: any) => {
      setHistory(history);
    });

    socket.on(\"gameState\", (gameState: GameStatusType) => {
      setGameState(gameState);
    });

    socket.on(\"previousHand\", (previousHand: UserType[]) => {
      setPreviousHand(previousHand);
    });

    socket.on(\"finishGame\", (user: UserType) => {
      let attrs = newState;
      let fauto = attrs.userInfo.f.auto;
      let sauto = attrs.userInfo.s.auto;
      let fbetAmount = attrs.userInfo.f.betAmount;
      let sbetAmount = attrs.userInfo.s.betAmount;
      let betStatus = newBetState;
      attrs.userInfo = user;
      attrs.userInfo.f.betAmount = fbetAmount;
      attrs.userInfo.s.betAmount = sbetAmount;
      attrs.userInfo.f.auto = fauto;
      attrs.userInfo.s.auto = sauto;
      if (!user.f.betted) {
        betStatus.fbetted = false;
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
        betStatus.sbetted = false;
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
    });

    socket.on(\"getBetLimits\", (betAmounts: { max: number; min: number }) => {
      setBetLimit({ maxBet: betAmounts.max, minBet: betAmounts.min });\n    });\n\n    socket.on(\"recharge\", () => {\n      setRechargeState(true);\n    });\n\n    socket.on(\"error\", (data) => {\n      setUserBetState({\n        ...userBetState,\n        [`${data.index}betted`]: false,\n      });\n      toast.error(data.message);\n    });\n\n    socket.on(\"success\", (data) => {\n      toast.success(data);\n    });\n    return () => {\n      socket.off(\"connect\");\n      socket.off(\"disconnect\");\n      socket.off(\"myBetState\");\n      socket.off(\"myInfo\");\n      socket.off(\"history\");\n      socket.off(\"gameState\");\n      socket.off(\"previousHand\");\n      socket.off(\"finishGame\");\n      socket.off(\"getBetLimits\");\n      socket.off(\"recharge\");\n      socket.off(\"error\");\n      socket.off(\"success\");\n    };\n  }, [socket]);\n\n  React.useEffect(() => {\n    let attrs = state;\n    let betStatus = userBetState;\n    if (gameState.GameState === \"BET\") {\n      if (betStatus.fbetState) {\n        if (state.userInfo.f.auto) {\n          if (state.fautoCound > 0) attrs.fautoCound -= 1;\n          else {\n            attrs.userInfo.f.auto = false;\n            betStatus.fbetState = false;\n            return;\n          }\n        }\n        let data = {\n          betAmount: state.userInfo.f.betAmount,\n          target: state.userInfo.f.target,\n          type: \"f\",\n          auto: state.userInfo.f.auto,\n        };\n        if (attrs.userInfo.balance - state.userInfo.f.betAmount < 0) {\n          toast.error(\"Your balance is not enough\");\n          betStatus.fbetState = false;\n          betStatus.fbetted = false;\n          return;\n        }\n        attrs.userInfo.balance -= state.userInfo.f.betAmount;\n        socket.emit(\"playBet\", data);\n        betStatus.fbetState = false;\n        betStatus.fbetted = true;\n        // update(attrs);\n        setUserBetState(betStatus);\n      }\n      if (betStatus.sbetState) {\n        if (state.userInfo.s.auto) {\n          if (state.sautoCound > 0) attrs.sautoCound -= 1;\n          else {\n            attrs.userInfo.s.auto = false;\n            betStatus.sbetState = false;\n            return;\n          }\n        }\n        let data = {\n          betAmount: state.userInfo.s.betAmount,\n          target: state.userInfo.s.target,\n          type: \"s\",\n          auto: state.userInfo.s.auto,\n        };\n        if (attrs.userInfo.balance - state.userInfo.s.betAmount < 0) {\n          toast.error(\"Your balance is not enough\");\n          betStatus.sbetState = false;\n          betStatus.sbetted = false;\n          return;\n        }\n        attrs.userInfo.balance -= state.userInfo.s.betAmount;\n        socket.emit(\"playBet\", data);\n        betStatus.sbetState = false;\n        betStatus.sbetted = true;\n        // update(attrs);\n        setUserBetState(betStatus);\n      }\n    }\n  }, [gameState.GameState, userBetState.fbetState, userBetState.sbetState]);\n\n  const getMyBets = async () => {\n    try {\n      const response = await fetch(`${config.api}/my-info`, {\n        method: \"POST\",\n        headers: {\n          \"Content-Type\": \"application/json\",\n        },\n        body: JSON.stringify({ name: state.userInfo.userName }),\n      });\n\n      if (response.ok) {\n        const data = await response.json();\n        if (data.status) {\n          update({ myBets: data.data as GameHistory[] });\n        }\n      } else {\n        console.error(\"Error:\", response.statusText);\n      }\n    } catch (error) {\n      console.log(\"getMyBets\", error);\n    }\n  };\n\n  useEffect(() => {\n    if (gameState.GameState === \"BET\") getMyBets();\n  }, [gameState.GameState]);\n\n  return (\n    <Context.Provider\n      value={{\n        state: state,\n        ...betLimit,\n        ...userBetState,\n        ...unity,\n        ...gameState,\n        currentTarget,\n        rechargeState,\n        myUnityContext: unityContext,\n        bettedUsers: [...bettedUsers],\n        previousHand: [...previousHand],\n        history: [...history],\n        setCurrentTarget,\n        update,\n        getMyBets,\n        updateUserBetState,\n      }}\n    >\n      {children}\n    </Context.Provider>\n  );\n};\n\nexport default Context;\n