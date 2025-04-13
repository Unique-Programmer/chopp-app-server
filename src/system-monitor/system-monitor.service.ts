import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import * as si from 'systeminformation';
import {
  SystemMonitorDto,
  CpuDto,
  MemoryDto,
  DiskDto,
  ProcessDto,
  DockerContainerStatsDto,
  DockerContainerMemoryDto,
  DockerContainerNetworkDto,
} from './dto/system-monitor.dto';
import * as Docker from 'dockerode';

@Injectable()
export class SystemMonitorService {
  async getSystemStats(): Promise<SystemMonitorDto> {
    try {
      const systemStats = await this.getSystemStatsInternal();
      const dockerStats = await this.getDockerStats();
      systemStats.docker = dockerStats;
      return systemStats;
    } catch (error) {
      Logger.error('Error fetching system stats:', error.message);
      throw new ServiceUnavailableException('Не удалось получить данные мониторинга');
    }
  }

  async getSystemStatsInternal(): Promise<SystemMonitorDto> {
    const [cpu, memory, disks, processes] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.processes(),
    ]);
    const appDiskMount = process.cwd();

    const appDisk = disks.find((disk) => appDiskMount.startsWith(disk.mount));

    const cpuDto = new CpuDto();
    cpuDto.load = cpu.currentLoad.toFixed(2) + '%';
    cpuDto.cores = cpu.cpus.length;
    cpuDto.user = cpu.currentLoadUser.toFixed(2) + '%';
    cpuDto.system = cpu.currentLoadSystem.toFixed(2) + '%';

    const memoryDto = new MemoryDto();
    memoryDto.total = (memory.total / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    memoryDto.used = (memory.used / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    memoryDto.free = (memory.free / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    memoryDto.usage = ((memory.used / memory.total) * 100).toFixed(2) + '%';

    const diskDto = new DiskDto();
    diskDto.mount = appDisk.mount;
    diskDto.total = (appDisk.size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    diskDto.used = (appDisk.used / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    diskDto.free = (appDisk.available / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    diskDto.usage = appDisk.use.toFixed(2) + '%';

    const processesDto = processes.list
      .sort((a, b) => b.memRss - a.memRss)
      .slice(0, 10)
      .map((proc) => {
        const processDto = new ProcessDto();
        processDto.pid = proc.pid;
        processDto.name = proc.name;
        processDto.cpu = proc.cpu.toFixed(2) + '%';
        processDto.mem = (proc.memRss / 1024).toFixed(2) + ' MB';
        return processDto;
      });

    const result = new SystemMonitorDto();
    result.cpu = cpuDto;
    result.memory = memoryDto;
    result.disk = diskDto;
    result.processes = processesDto;

    return result;
  }

  async getDockerStats(): Promise<DockerContainerStatsDto[]> {
    const docker = new Docker({ socketPath: '/var/run/docker.sock' });
    const containers = await docker.listContainers({ all: true });

    const stats = await Promise.all(
      containers.map(async (container) => {
        const containerStats = await docker.getContainer(container.Id).stats({ stream: false });

        const cpuDelta =
          containerStats.cpu_stats.cpu_usage.total_usage - containerStats.precpu_stats.cpu_usage.total_usage;
        const systemDelta = containerStats.cpu_stats.system_cpu_usage - containerStats.precpu_stats.system_cpu_usage;
        const cpuPercent = (cpuDelta / systemDelta) * 100 * containerStats.cpu_stats.online_cpus;

        const memoryUsage = containerStats.memory_stats.usage;
        const memoryLimit = containerStats.memory_stats.limit;
        const memoryPercent = (memoryUsage / memoryLimit) * 100;

        const stats = new DockerContainerStatsDto();
        stats.id = container.Id.slice(0, 12);
        stats.name = container.Names[0].replace('/', '');
        stats.state = container.State;
        stats.cpu = cpuPercent.toFixed(2) + '%';

        stats.memory = new DockerContainerMemoryDto();
        stats.memory.used = (memoryUsage / 1024 / 1024).toFixed(2) + ' MB';
        stats.memory.limit = (memoryLimit / 1024 / 1024).toFixed(2) + ' MB';
        stats.memory.percent = memoryPercent.toFixed(2) + '%';

        stats.network = new DockerContainerNetworkDto();
        stats.network.rx = (containerStats.networks?.eth0?.rx_bytes / 1024 / 1024).toFixed(2) + ' MB';
        stats.network.tx = (containerStats.networks?.eth0?.tx_bytes / 1024 / 1024).toFixed(2) + ' MB';

        return stats;
      }),
    );

    return stats;
  }
}
