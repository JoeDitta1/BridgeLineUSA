export function normalizeLocal(text){
  const raw=(text||'').trim();
  if(!raw) return {confidence:'None'};
  const ws='\\s*'; const X='[xXÃ—]';
  const rxW=new RegExp(`^W${ws}(\\d+?)${ws}${X}${ws}(\\d+)#?$`,'i');
  const rxC=new RegExp(`^C${ws}(\\d+?)${ws}${X}${ws}(\\d+)#?$`,'i');
  const rxL=new RegExp(`^L${ws}(\\d+)(?:${ws}${X}${ws}(\\d+))?${ws}${X}${ws}([.\\d/]+)$`,'i');
  const rxPl=new RegExp(`^(?:A36|PL|Plate)${ws}([\\d./]+)"?$`,'i');
  const mW=raw.match(rxW); if(mW){ return {confidence:'High',best:{family:'W-Beam',size:`W${mW[1]}x${mW[2]}`,unit_type:'Per Foot'}};}
  const mC=raw.match(rxC); if(mC){ return {confidence:'High',best:{family:'Channel',size:`C${mC[1]}x${mC[2]}`,unit_type:'Per Foot'}};}
  const mL=raw.match(rxL); if(mL){ const size=mL[2]?`L${mL[1]}x${mL[2]}x${mL[3]}`:`L${mL[1]}x${mL[1]}x${mL[3]}`; return {confidence:'High',best:{family:'Angle',size,unit_type:'Per Foot'}};}
  const mP=raw.match(rxPl); if(mP){ return {confidence:'High',best:{family:'Plate',size:`A36 ${mP[1]}"`,unit_type:'Sq In'}};}
  return {confidence:'Low'};
}
