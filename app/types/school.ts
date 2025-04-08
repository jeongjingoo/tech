export interface School {
  _id: string;
  data: {
    name: string;
    istech: number;
    address: string;
    total_classes: number;
    teachers_room_num: string;
    admin_room_num: string;
    team: string;
    lat: number;
    lon: number;
  };
  iscomp: number;
  createdAt: string;
}