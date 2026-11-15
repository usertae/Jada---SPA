package br.com.jadespa.admin;

import br.com.jadespa.admin.model.Aula;
import br.com.jadespa.admin.repository.AulaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Configuration
public class AulaDataLoader {

    @Bean
    CommandLineRunner carregarAulas(AulaRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                adicionar(repository, "Yoga",
                        "Práticas de alongamento, respiração e movimentos para melhorar o equilíbrio e o bem-estar.",
                        DayOfWeek.MONDAY, "08:00", "09:00");
                adicionar(repository, "Yoga",
                        "Práticas de alongamento, respiração e movimentos para melhorar o equilíbrio e o bem-estar.",
                        DayOfWeek.MONDAY, "18:00", "19:00");
                adicionar(repository, "Yoga",
                        "Práticas de alongamento, respiração e movimentos para melhorar o equilíbrio e o bem-estar.",
                        DayOfWeek.WEDNESDAY, "08:00", "09:00");
                adicionar(repository, "Yoga",
                        "Práticas de alongamento, respiração e movimentos para melhorar o equilíbrio e o bem-estar.",
                        DayOfWeek.WEDNESDAY, "18:00", "19:00");

                adicionar(repository, "Pilates",
                        "Exercícios que trabalham força, postura, flexibilidade e consciência corporal.",
                        DayOfWeek.WEDNESDAY, "09:00", "10:00");
                adicionar(repository, "Pilates",
                        "Exercícios que trabalham força, postura, flexibilidade e consciência corporal.",
                        DayOfWeek.WEDNESDAY, "17:00", "18:00");
                adicionar(repository, "Pilates",
                        "Exercícios que trabalham força, postura, flexibilidade e consciência corporal.",
                        DayOfWeek.FRIDAY, "09:00", "10:00");
                adicionar(repository, "Pilates",
                        "Exercícios que trabalham força, postura, flexibilidade e consciência corporal.",
                        DayOfWeek.FRIDAY, "17:00", "18:00");

                adicionar(repository, "Cerâmica Fria",
                        "Uma atividade criativa para relaxar e desenvolver novas habilidades, criando peças feitas à mão.",
                        DayOfWeek.FRIDAY, "14:00", "16:00");
                adicionar(repository, "Cerâmica Fria",
                        "Uma atividade criativa para relaxar e desenvolver novas habilidades, criando peças feitas à mão.",
                        DayOfWeek.FRIDAY, "16:00", "18:00");
                adicionar(repository, "Cerâmica Fria",
                        "Uma atividade criativa para relaxar e desenvolver novas habilidades, criando peças feitas à mão.",
                        DayOfWeek.SATURDAY, "09:00", "11:00");
                adicionar(repository, "Cerâmica Fria",
                        "Uma atividade criativa para relaxar e desenvolver novas habilidades, criando peças feitas à mão.",
                        DayOfWeek.SATURDAY, "14:00", "16:00");
            }
        };
    }

    private void adicionar(
            AulaRepository repository,
            String nome,
            String descricao,
            DayOfWeek dia,
            String inicio,
            String fim
    ) {
        Aula aula = new Aula();
        aula.setNome(nome);
        aula.setDescricao(descricao);
        aula.setDiaSemana(dia);
        aula.setHorarioInicio(LocalTime.parse(inicio));
        aula.setHorarioFim(LocalTime.parse(fim));
        aula.setVagas(10);
        aula.setAtivo(true);

        repository.save(aula);
    }
}