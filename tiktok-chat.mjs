// Support both the v3 protocol and the older flattened connector events.
export function parseTikTokChat(data, createId) {
 const user=data?.user||data;
 const userId=user?.idStr||user?.id||user?.userId||user?.uniqueId||user?.displayId;
 const text=data?.content??data?.comment;
 if(!userId||String(userId)==='0'||typeof text!=='string'||!text.trim())return null;
 const created=Number(data.common?.createTime||data.createTime);
 const sentAt=Number.isFinite(created)&&created>0?(created<1e12?created*1000:created):undefined;
 return {id:String(data.common?.msgId||data.msgId||createId()),userId:`live:${userId}`,name:user.nickname||user.uniqueId||user.displayId||'Người xem',text,source:'live',...(sentAt?{sentAt}:{})};
}
