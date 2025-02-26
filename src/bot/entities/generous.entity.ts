import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Generous {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column({nullable: true})
  last_state: string;

  @Column({nullable: true})
  donations: string;

  @Column({nullable: true, default: false})
  isDonating: boolean;
}
